const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function loadFee(enabled) {
  const source = fs.readFileSync('lib/paypal-checkout-fee.ts','utf8').replace('enabled: true', `enabled: ${enabled}`);
  const output = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  const module = {exports:{}};
  vm.runInNewContext(output,{module,exports:module.exports});
  return module.exports;
}
test('PayPal adds exactly $3 once to the already discounted product and transport total',()=>{
  const fee=loadFee(true);
  assert.equal(fee.getPayPalCheckoutFeeUsd(),3);
  const products=89, discount=4.45, transport=48;
  const base=Math.round((products-discount+transport)*100)/100;
  assert.equal(fee.getPayPalCheckoutTotalUsd(base),135.55);
  assert.equal(base,132.55); // WhatsApp retains the common total.
});
test('disabling the single setting removes the fee and preserves cents',()=>{
  const fee=loadFee(false);
  assert.equal(fee.getPayPalCheckoutFeeUsd(),0);
  assert.equal(fee.getPayPalCheckoutTotalUsd(132.55),132.55);
});
test('PayPal total rounds to cents',()=>{
  assert.equal(loadFee(true).getPayPalCheckoutTotalUsd(0.1+0.2),3.3);
});
