

# Summary

This application is an example of how the [Harness CLI](https://github.com/ldhertert/harness-cli) commands can be exposed via a REST API.  There are a handful of commmands that have been implemented in this repo and are documented below.  

Note: there is minimal error handling implemented in these examples.

# Usage

Requires: NodeJS v12+

* Clone this repo
* Run `npm install`
* Run `node index.js`

# API Details and usage:

There are a handful of common parameters that can be provided in
various ways:

* Harness Account ID
* Harness API Key
* Harness Username (required for config as code APIs)
* Harness Password (required for config as code APIs)

The simplest way to pass these is to call the login command which returns a token that can be reused across subsequent requests.  The options include:

* Cookie from `/login` persists across requests
* Token from `/login` passed in `x-jwt-token` header
* Using basic auth (if password is blank, the username is used as the API key)
* Querystring parameters: `http://localhost:3000/apps?harnessAccountId=xxxx`
* Header: `x-harness-account-id: xxx`
* Setting environment variable: `HARNESS_USERNAME=xxx`

## Login

POST `/login`

Generate a JWT token that contains all required account information, which can be used to authenticate to other API requests.  The token
is returned in the response body as well as in a cookie that can be persisted across requests.

### Example usage:

```sh
ACCOUNT_ID='your account id'
API_KEY='your api key'
USERNAME='your harness username'
PASSWORD='your harness password'

curl --location --request POST "http://localhost:3000/login" \
    --header "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "harnessAccountId=${ACCOUNT_ID}" \
    --data-urlencode "harnessApiKey=${API_KEY}" \
    --data-urlencode "harnessUsername=${USERNAME}" \
    --data-urlencode "harnessPassword=${PASSWORD}"
```

### Response:

```json
{
  "token": "..."
}
```

## Fetch all applications

### Example usage:

```sh
curl 'http://localhost:3000/apps' \ 
    --header "x-jwt-token: ${JWT_TOKEN}"
```

### Response:

```json
[
  {
    "id": "tA-8xI-UQrWIc50h6hdamg",
    "name": "cv-demo",
    "description": null,
    "createdAt": 1607545302159,
    "createdBy": null
  },
  ...
]
```

## Get Application by name or id

### Example usage:

```sh
curl 'http://localhost:3000/apps/cv-demo' \ 
    --header "x-jwt-token: ${JWT_TOKEN}"
```

### Response:

```json
{
  "id": "tA-8xI-UQrWIc50h6hdamg",
  "name": "cv-demo",
  "description": null,
  "createdAt": 1607545302159,
  "createdBy": null
}
```

## Config as code - list files

Requires Harness username and password global variables to be provided.

### Example usage:

```sh
curl 'http://localhost:3000/config-as-code/list-files' \ 
    --header "x-jwt-token: ${JWT_TOKEN}"
```

### Response:

```json
[
    "Setup/Defaults.yaml",
    "Setup/Tags.yaml",
    ...
]
```

## Config as code - get file contents

Requires Harness username and password global variables to be provided.

Fetch YAML contents for config as code file at a specific path.  
Query string params: 
* `path`: the path to the file
* `raw`: Optional - if true, then the response will be raw YAML.  Otherwise, the yaml will be returned inside a JSON array.

### Example usage:

```sh
curl 'http://localhost:3000/config-as-code/path=Setup/Tags.yaml&raw=true' \ 
    --header "x-jwt-token: ${JWT_TOKEN}"
```

### Response:

```yaml
harnessApiVersion: '1.0'
type: TAG
tag:
- name: some_tag
```

OR

```json
[
    {
        "path": "Setup/Tags.yaml",
        "content": "harnessApiVersion: '1.0'\ntype: TAG\ntag:\n- name: some_tag"
    }
]
```

## Config as code - create or update YAML contents for path

Requires Harness username and password global variables to be provided.

### Example usage:

```sh

FILE_PATH='Setup/Tags.yaml'
CONTENT='
harnessApiVersion: "1.0"
type: TAG
tag:
- name: some_tag
- name: another_tag
'

curl --location --request POST 'http://localhost:3000/config-as-code/upsert' \
    --header "x-jwt-token: ${JWT_TOKEN}" \
    --header "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "content=${CONTENT}" \
    --data-urlencode "path=${FILE_PATH}"
```

### Response:

```json
{
    "metaData": {},
    "resource": {
        "yamlFilePath": "Setup/Tags.yaml",
        "status": "SUCCESS",
        "errorMssg": ""
    },
    "responseMessages": []
}
```

Or in the event of a failure:

```json
{
    "metaData": {},
    "resource": {
        "yamlFilePath": "Setup/Tags.yaml",
        "status": "FAILED",
        "errorMssg": "Invalid request: Tag is in use. Cannot delete"
    },
    "responseMessages": []
}
```