// Teaching fixture: run `node reconciliation-starter.mjs` beside the two CSV files.
// This simple parser is intentionally limited to the supplied unquoted CSV fixture.
import { readFile } from 'node:fs/promises';
async function readCsv(path) {
 const [header, ...rows] = (await readFile(new URL(path, import.meta.url), 'utf8')).trim().split(/\r?\n/);
 const keys = header.split(',');
 return rows.map(row => Object.fromEntries(row.split(',').map((v,i)=>[keys[i],keys[i]==='amount'?Number(v):v])));
}
const invoices = await readCsv('invoices.csv');
const payments = await readCsv('payments.csv');
const seen = new Set(); const quarantine = []; const accepted = [];
for (const payment of payments) {
 if (seen.has(payment.payment_id)) quarantine.push(payment);
 else { seen.add(payment.payment_id); accepted.push(payment); }
}
const key = row => `${row.invoice_id}|${row.supplier_id}|${row.currency}`;
const invoiceKeys = new Set(invoices.map(key));
const totals = new Map();
for (const payment of accepted) totals.set(key(payment),(totals.get(key(payment))??0)+payment.amount);
const results = invoices.map(invoice=>({...invoice,paid:totals.get(key(invoice))??0,remaining:invoice.amount-(totals.get(key(invoice))??0)}));
const unmatched = accepted.filter(payment=>!invoiceKeys.has(key(payment)));
const sum = (rows,field='amount')=>rows.reduce((total,row)=>total+row[field],0);
console.log(JSON.stringify({
 controls:{invoice_count:invoices.length,invoice_total:sum(invoices),raw_payment_rows:payments.length,raw_payment_total:sum(payments),quarantined_duplicate_rows:quarantine.length,quarantined_duplicate_amount:sum(quarantine),accepted_payment_rows:accepted.length,accepted_payment_total:sum(accepted),matched_payment_total:sum(results,'paid'),unmatched_payment_total:sum(unmatched),remaining_invoice_balance:sum(results,'remaining'),fully_paid_invoices:results.filter(r=>r.remaining===0).length,partially_paid_invoices:results.filter(r=>r.paid>0&&r.remaining>0).length,unpaid_invoices:results.filter(r=>r.paid===0).length},
 quarantine,unmatched,exceptions:results.filter(r=>r.remaining!==0)
},null,2));
