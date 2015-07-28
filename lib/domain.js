/**
 * @license
 * Copyright 2015 Telefónica Investigación y Desarrollo, S.A.U
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var domain = require('domain');

/**
 * Express middleware that creates a domain per request in order to catch uncaught exceptions related
 * to the request.
 *
 * @param {Object} logger
 *    Optional logger to write errors in the domain. If not defined, it uses console as logger.
 * @return {Function(req, res, next)} Express middleware.
 */
module.exports = function(logger) {

  var errorLogger = logger || console;

  return function domainMiddleware(req, res, next) {
    var requestDomain = domain.create();
    //we need to explicitly bind req and res to the newly created domain
    //see https://nodejs.org/api/domain.html#domain_explicit_binding
    requestDomain.add(req);
    requestDomain.add(res);
    var cleanDomain;

    var domainErrorHandler = function(err) {
      errorLogger.error(err);
      cleanDomain();
    };

    var requestHandler = function() {
      next();
    };

    cleanDomain = function() {
      requestDomain.removeListener('error', domainErrorHandler);
      res.removeListener('finish', cleanDomain);
      requestDomain.remove(req);
      requestDomain.remove(res);
      requestDomain.exit();
      requestDomain = null;
      domainErrorHandler = null;
      requestHandler = null;
    };

    res.on('finish', cleanDomain);
    requestDomain.on('error', domainErrorHandler);
    requestDomain.enter();
    requestDomain.run(requestHandler);
  };
};
