# express-domaining

Express middleware to automatically create and destroy a [domain](https://nodejs.org/api/domain.html).

## Installation

```bash
npm install express-domaining
```

## Basic usage

```js
var express = require('express'),
    expressDomain = require('express-domaining');

var app = express();
app.use(expressDomain());

app.listen(3000);
```

## License

Copyright 2015 [Telefónica Investigación y Desarrollo, S.A.U](http://www.tid.es)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
