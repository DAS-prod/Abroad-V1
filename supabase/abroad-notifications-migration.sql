-- Separate abroad notification queue and logs; domestic notification records unchanged.
BEGIN;
CREATE TABLE IF NOT EXISTS public.abroad_notification_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 order_id text NOT NULL REFERENCES public.abroad_orders(id),
 notification_type text NOT NULL CHECK(notification_type IN ('abroad_order_paid','abroad_whatsapp_order')),
 title text NOT NULL DEFAULT '',body text,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','failed')),
 error_message text,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 sent_device_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
 attempts integer NOT NULL DEFAULT 0,lock_token uuid,locked_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),sent_at timestamptz,
 UNIQUE(order_id,notification_type)
);
ALTER TABLE public.abroad_notification_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS abroad_notification_status_created ON public.abroad_notification_logs(status,created_at);
CREATE OR REPLACE FUNCTION public.claim_abroad_notification(p_order_id text,p_type text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE claimed public.abroad_notification_logs; lease uuid:=gen_random_uuid();
BEGIN
 IF p_type NOT IN ('abroad_order_paid','abroad_whatsapp_order') THEN RAISE EXCEPTION 'Invalid notification type'; END IF;
 INSERT INTO public.abroad_notification_logs(order_id,notification_type) VALUES(p_order_id,p_type) ON CONFLICT(order_id,notification_type) DO NOTHING;
 UPDATE public.abroad_notification_logs SET status='processing',lock_token=lease,locked_until=now()+interval '2 minutes',attempts=attempts+1,updated_at=now()
 WHERE order_id=p_order_id AND notification_type=p_type AND status<>'sent' AND (locked_until IS NULL OR locked_until<now()) RETURNING * INTO claimed;
 IF NOT FOUND THEN RETURN NULL; END IF;
 RETURN to_jsonb(claimed);
END $$;
REVOKE ALL ON FUNCTION public.claim_abroad_notification(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_abroad_notification(text,text) TO service_role;
COMMIT;
