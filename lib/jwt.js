'use strict';

/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var googleapis = require('googleapis');

/**
 * The JWT authorization is ideal for performing server-to-server
 * communication without asking for user consent.
 *
 * Suggested reading for Admin SDK users using service accounts:
 * https://developers.google.com/admin-sdk/directory/v1/guides/delegation
 *
 * Note on the private_key.pem:
 * Node.js currently does not support direct access to the keys stored within
 * PKCS12 file (see issue comment
 * https://github.com/joyent/node/issues/4050#issuecomment-8816304)
 * so the private key must be extracted and converted to a passphrase-less
 * RSA key: openssl pkcs12 -in key.p12 -nodes -nocerts > key.pem
 */

// Google Service Account details
var GSA = require('./g_service_account');

var authClient = new googleapis.auth.JWT(
/* function JWT(email, keyFile, key, scopes, person, [..]) */
SA.client_email, null, SA.private_key, ['https://www.googleapis.com/auth/drive.readonly']);

authClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('SUCCESS', tokens);

  var drive = googleapis.drive({ version: 'v3', auth: authClient });
  drive.files.list({
    q: "'0B4gB3nV9reGKdEpDWXlpcFpUQ3M' in parents"
  }, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    // Loop files and get urls
    console.log('------------');
    console.log(data);
  });
});

module.exports = authClient;
//# sourceMappingURL=jwt.js.map
