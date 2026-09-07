import assert from 'node:assert/strict';
import test from 'node:test';

import { SiteDataApiError } from '../src/api-client.js';
import {
  SITEDATA_PAYMENT_URL,
  toToolError,
} from '../src/response.js';

test('adds the payment URL when rankings require a paid membership', () => {
  const result = toToolError(
    new SiteDataApiError(403, {
      code: 'membership_required',
      message: 'An active SiteData membership is required to access rankings.',
      data: null,
    })
  );

  assert.equal(result.isError, true);
  assert.equal(
    result.content[0]?.text,
    `An active SiteData membership is required to access rankings. Subscribe or upgrade at ${SITEDATA_PAYMENT_URL}`
  );
  assert.deepEqual(result.structuredContent, {
    status: 403,
    error: {
      code: 'membership_required',
      message: 'An active SiteData membership is required to access rankings.',
      data: null,
    },
    paymentUrl: 'https://sitedata.dev/payment',
  });
});

test('does not add a payment URL to unrelated forbidden responses', () => {
  const result = toToolError(
    new SiteDataApiError(403, {
      code: 'forbidden',
      message: 'Forbidden',
    })
  );

  assert.equal(
    result.content[0]?.text,
    'This SiteData account does not have access to the requested resource.'
  );
  assert.equal(result.structuredContent?.paymentUrl, undefined);
});
