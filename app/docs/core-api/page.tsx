"use client";

import { useEffect } from "react";
import Section from "@/components/shared/Section";
import CodeBlock from "@/components/ui/CodeBlock";

const httpMethodsData = [
  {
    id: "get",
    title: "GET Request",
    description:
      "Retrieve data from a server. GET requests should only retrieve data and should not have any other effect. Returns a Response directly -- no await needed.",
    parameters: [
      ["url", "str", "Required", "The endpoint URL"],
      [
        "params",
        "dict",
        "{}",
        "Query parameters for filtering, pagination, sorting",
      ],
      ["headers", "dict", "{}", "Custom HTTP headers"],
      [
        "responseType",
        "str",
        '"json"',
        "Response format: json, text, blob, arraybuffer, stream",
      ],
      ["timeout", "int/float", "30", "Override client timeout"],
    ],
    returns: [
      "Response",
      "Response object containing data, status, headers, config",
    ],
    code: `# Basic GET request
response = client.get('https://api.example.com/users')

# GET with query parameters
response = client.get('/users', params={'page': 1, 'limit': 10, 'sort': 'desc'})
print(response.data)

# GET with custom headers
response = client.get('/protected', headers={'Authorization': 'Bearer token123'})`,
  },
  {
    id: "post",
    title: "POST Request",
    description:
      "Send data to create a new resource. Accepts JSON, FormData, URL-encoded data, or raw bytes. Large file uploads via FormData stream automatically -- the file is never fully loaded into memory.",
    parameters: [
      ["url", "str", "Required", "The endpoint URL"],
      ["data", "Any", "None", "Request body (dict, FormData, bytes, str)"],
      [
        "headers",
        "dict",
        "{}",
        "Custom HTTP headers (Content-Type auto-detected)",
      ],
      ["responseType", "str", '"json"', "Response format"],
      [
        "onUploadProgress",
        "Callable",
        "None",
        "Progress callback for uploads: fn(loaded, total)",
      ],
    ],
    returns: ["Response", "Response object with created resource data"],
    code: `# POST with JSON data
user_data = {'name': 'John Doe', 'email': 'john@example.com'}
response = client.post('/users', data=user_data)
print(f"Created ID: {response.data['id']}")

# POST with FormData (file upload -- large files stream automatically)
from atomhttp import FormData
form = FormData()
form.append('name', 'John Doe')
form.append('avatar', open('photo.jpg', 'rb'), filename='photo.jpg')
response = client.post('/users', data=form)

# POST with progress tracking
def on_progress(loaded, total):
    print(f"Uploaded: {loaded}/{total} bytes")
response = client.post('/upload', data=large_file, onUploadProgress=on_progress)`,
  },
  {
    id: "put",
    title: "PUT Request",
    description:
      "Completely replace an existing resource. Requires the complete resource data.",
    parameters: [
      ["url", "str", "Required", "The endpoint URL with resource ID"],
      ["data", "dict", "Required", "Complete resource data"],
      ["headers", "dict", "{}", "Custom HTTP headers"],
    ],
    returns: ["Response", "Response object with updated resource data"],
    code: `# Full resource replacement
update_data = {'id': 1, 'name': 'Jane Doe', 'email': 'jane@example.com', 'role': 'admin'}
response = client.put('/users/1', data=update_data)

# Conditional update
response = client.put('/users/1', data=update_data,
    headers={'If-Unmodified-Since': 'Wed, 21 Oct 2024 07:28:00 GMT'})`,
  },
  {
    id: "patch",
    title: "PATCH Request",
    description:
      "Partially update an existing resource. Only send the fields that need to be changed.",
    parameters: [
      ["url", "str", "Required", "The endpoint URL with resource ID"],
      ["data", "dict", "Required", "Fields to update (partial data)"],
      ["headers", "dict", "{}", "Custom HTTP headers"],
    ],
    returns: ["Response", "Response object with updated resource data"],
    code: `# Partial update
response = client.patch('/users/1', data={'email': 'newemail@example.com'})

# Update multiple fields
response = client.patch('/users/1', data={'email': 'newemail@example.com', 'role': 'editor'})

# JSON Patch operations
response = client.patch('/users/1', data=[
    {'op': 'replace', 'path': '/email', 'value': 'new@example.com'}
])`,
  },
  {
    id: "delete",
    title: "DELETE Request",
    description: "Remove a resource from the server.",
    parameters: [
      ["url", "str", "Required", "The endpoint URL with resource ID"],
      ["params", "dict", "{}", "Query parameters for batch delete"],
      ["headers", "dict", "{}", "Custom HTTP headers"],
    ],
    returns: ["Response", "Response object (status 204 on success)"],
    code: `# Delete a single resource
response = client.delete('/users/1')
if response.status == 204:
    print("User deleted successfully")

# Batch delete
response = client.delete('/users', params={'ids': '1,2,3'})

# Conditional delete
response = client.delete('/users/1', headers={'If-Match': 'etag123'})`,
  },
  {
    id: "head",
    title: "HEAD Request",
    description: "Retrieve headers only, without the response body.",
    parameters: [
      ["url", "str", "Required", "The endpoint URL"],
      ["headers", "dict", "{}", "Custom HTTP headers"],
    ],
    returns: ["Response", "Response object with headers but empty body"],
    code: `# Check if resource exists
response = client.head('/large-file.pdf')
print(f"Size: {response.headers.get('Content-Length')} bytes")
print(f"Type: {response.headers.get('Content-Type')}")
print(f"Modified: {response.headers.get('Last-Modified')}")

# Check API health
response = client.head('/health')
print(f"Status: {'healthy' if response.ok else 'unhealthy'}")`,
  },
  {
    id: "options",
    title: "OPTIONS Request",
    description: "Discover which HTTP methods are supported by a resource.",
    parameters: [
      ["url", "str", "Required", "The endpoint URL"],
      ["headers", "dict", "{}", "Custom HTTP headers"],
    ],
    returns: [
      "Response",
      "Response with Allow header listing supported methods",
    ],
    code: `# Discover allowed methods
response = client.options('/users/1')
print(f"Allowed: {response.headers.get('Allow', '')}")

# CORS preflight
response = client.options('/api/data', headers={
    'Origin': 'https://myapp.com',
    'Access-Control-Request-Method': 'POST'
})`,
  },
  {
    id: "generic",
    title: "Generic Request Method",
    description: "Unified request method for maximum flexibility.",
    parameters: [
      ["method", "str", '"GET"', "HTTP method (GET, POST, etc.)"],
      ["url", "str", "Required", "Request URL"],
      ["data", "Any", "None", "Request body"],
      ["params", "dict", "{}", "Query parameters"],
      ["headers", "dict", "{}", "Custom headers"],
      ["timeout", "int", "30", "Request timeout"],
    ],
    returns: ["Response", "Response object"],
    code: `# Full control over request configuration
response = client.request(
    'POST',
    '/api/data',
    data={'key': 'value'},
    headers={'X-Custom': 'header'},
    params={'version': 'v2'},
    timeout=30,
    maxRedirects=0,
    responseType='text',
)

# Dynamic method selection
method = 'DELETE' if condition else 'PUT'
response = client.request(method, '/resource/1')`,
  },
];

const responseProperties = [
  [
    "response.data",
    "Parsed response body",
    "dict, list, str, bytes",
    "response.data['id']",
  ],
  ["response.status", "HTTP status code", "int", "response.status == 200"],
  [
    "response.status_text",
    "HTTP status message",
    "str",
    "response.status_text",
  ],
  [
    "response.headers",
    "Response headers",
    "dict",
    "response.headers['Content-Type']",
  ],
  [
    "response.config",
    "Original request config",
    "RequestConfig",
    "response.config.url",
  ],
  ["response.ok", "Success indicator (200-299)", "bool", "if response.ok: ..."],
  ["response.elapsed", "Wall-clock request duration", "float | None", "response.elapsed"],
  ["response.url", "Final URL after redirects", "str | None", "response.url"],
];

const configOptions = [
  ["base_url", "str", '""', "Base URL prepended to relative paths"],
  ["timeout", "int/float", "30", "Request timeout in seconds"],
  ["headers", "dict", "{}", "Default headers sent with every request"],
  ["cookies", "bool", "True", "Enable the client's persistent cookie jar"],
  ["max_workers", "int", "10", "Size of the persistent thread pool backing .all()/.submit()/.map()"],
  ["maxRedirects", "int", "5", "Maximum number of redirects to follow"],
  [
    "responseType",
    "str",
    '"json"',
    "Response format: json, text, blob, arraybuffer, stream",
  ],
  ["keepAlive", "bool", "True", "Enable HTTP keep-alive connections"],
  [
    "verify",
    "bool | str",
    "True",
    "SSL verification: True/False, or a path to a custom CA bundle",
  ],
  ["cert", "str | tuple", "None", "Client cert for mTLS: a path, or (cert_path, key_path)"],
  [
    "retryConfig",
    "dict",
    "None",
    "Retry settings for transient failures: max_retries, backoff_factor, status_forcelist. Retry-After is honored automatically.",
  ],
  [
    "decompress",
    "bool",
    "True",
    "Automatically decompress gzip/deflate/brotli responses",
  ],
  ["adapter", "BaseAdapter", "HTTPAdapter()", "Custom transport adapter, e.g. MockAdapter for tests"],
];

const errorTypes = [
  [
    "AtomHTTPRequestError",
    "Bad request (4xx) or malformed request, or rejected by validateStatus",
    "ERR_BAD_{status}",
  ],
  [
    "AtomHTTPNetworkError",
    "Network connectivity issues, DNS errors, connection refused",
    "ERR_NETWORK",
  ],
  ["AtomHTTPTimeoutError", "Request exceeded timeout limit", "ECONNABORTED"],
  ["AtomHTTPCancelError", "Request was aborted via AbortController", "ERR_CANCELED"],
];

const Table = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) => (
  <div className="overflow-x-auto rounded-xl border border-[#1a1a1a] mb-6">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[#1f1f1f]">
          {headers.map((h, i) => (
            <th
              key={i}
              className="text-left py-3 px-4 text-gray-400 font-medium"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-[#141414] last:border-0">
            {row.map((cell, j) => (
              <td key={j} className="py-3 px-4 text-sm text-gray-500">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mt-4 p-4 rounded-xl border border-[#1a1a1a]">
    <h3 className="text-md font-medium text-white mb-2">{title}</h3>
    {children}
  </div>
);

export default function CoreApiPage() {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Core API
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Essential HTTP methods and configuration for everyday use — every
          method is synchronous by default
        </p>
      </div>

      <div className="space-y-10 sm:space-y-12">
        <Section id="http-methods" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              HTTP Methods
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              AtomHTTP supports all standard HTTP methods with a plain,
              synchronous interface -- no <code>await</code> required. Each
              method returns a Response object containing the parsed response
              body, status code, headers, and original request configuration.
              The exact same methods exist on <code>AsyncAtomHTTP</code>, just
              awaited.
            </p>
          </div>
          <div className="space-y-8">
            {httpMethodsData.map((m) => (
              <div
                key={m.id}
                className="border border-[#1a1a1a] rounded-xl p-5 hover:border-[#2a2a2a] transition-all"
              >
                <h3 className="text-lg font-medium text-white mb-2">
                  {m.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{m.description}</p>

                <h4 className="text-sm font-medium text-white mb-2">
                  Parameters
                </h4>
                <Table
                  headers={["Parameter", "Type", "Default", "Description"]}
                  rows={m.parameters}
                />

                <h4 className="text-sm font-medium text-white mb-2">
                  Returns
                </h4>
                <div className="text-sm text-gray-400 mb-4">
                  <code className="text-gray-300">{m.returns[0]}</code> —{" "}
                  {m.returns[1]}
                </div>

                <h4 className="text-sm font-medium text-white mb-2">Example</h4>
                <CodeBlock language="python" code={m.code} />
              </div>
            ))}
          </div>
        </Section>

        <Section id="response-handling" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Response Object
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              Every request returns a Response object with the following
              properties:
            </p>
          </div>
          <Table
            headers={["Property", "Description", "Type", "Example"]}
            rows={responseProperties}
          />

          <CodeBlock
            language="python"
            code={`response = client.get('https://httpbin.org/get')
print(f"Status: {response.status} {response.status_text}")
print(f"Content-Type: {response.headers.get('Content-Type')}")
print(f"Body: {response.data}")
print(f"URL: {response.config.url}")

# Chainable status check
data = client.get('/users/1').raise_for_status().data`}
          />

          <InfoCard title="Response Types">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <code className="text-gray-300">json</code>
                <p className="text-gray-500 text-xs mt-1">
                  Parses as dict/list (default)
                </p>
              </div>
              <div>
                <code className="text-gray-300">text</code>
                <p className="text-gray-500 text-xs mt-1">
                  Returns raw text → str
                </p>
              </div>
              <div>
                <code className="text-gray-300">blob / arraybuffer</code>
                <p className="text-gray-500 text-xs mt-1">
                  Returns binary → bytes
                </p>
              </div>
              <div>
                <code className="text-gray-300">stream</code>
                <p className="text-gray-500 text-xs mt-1">
                  Raw urllib3.HTTPResponse — prefer client.stream()
                </p>
              </div>
            </div>
          </InfoCard>
        </Section>

        <Section id="configuration" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Client Configuration
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              Configure your client with defaults that apply to every request:
            </p>
          </div>
          <Table
            headers={["Option", "Type", "Default", "Description"]}
            rows={configOptions}
          />

          <CodeBlock
            language="python"
            code={`client = AtomHTTP(
    base_url='https://api.example.com',
    timeout=15,
    headers={'X-API-Key': 'your-api-key', 'Accept': 'application/json'},
    maxRedirects=3,
    responseType='json',
    keepAlive=True,
    verify=True,
    max_workers=20,
    retryConfig={
        'max_retries': 3,
        'backoff_factor': 0.3,
        'status_forcelist': [408, 429, 500, 502, 503, 504],
    },
)

# All requests use these defaults
response = client.get('/users')

# Override for specific request
response = client.get('/slow', timeout=60)`}
          />

          <InfoCard title="Configuration Inheritance">
            <p className="text-gray-400 text-sm">
              Client-level defaults are merged with request-level options.
              Headers are deeply merged (request headers override client
              headers), while other options are replaced entirely.
            </p>
          </InfoCard>
        </Section>

        <Section id="headers-params" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Headers &amp; Query Parameters
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              Add custom headers for authentication and metadata. Use query
              parameters for filtering and pagination.
            </p>
          </div>

          <CodeBlock
            language="python"
            code={`response = client.get('https://httpbin.org/get',
    params={'search': 'python', 'page': 2, 'limit': 20},
    headers={'Authorization': 'Bearer token123', 'X-Custom-Header': 'value'}
)`}
          />

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <InfoCard title="Common Headers">
              <div className="space-y-2">
                <div>
                  <code className="text-gray-300 text-sm">Authorization</code>
                  <p className="text-gray-500 text-xs">
                    Bearer token or Basic auth
                  </p>
                </div>
                <div>
                  <code className="text-gray-300 text-sm">Content-Type</code>
                  <p className="text-gray-500 text-xs">
                    Media type of request body
                  </p>
                </div>
                <div>
                  <code className="text-gray-300 text-sm">Accept</code>
                  <p className="text-gray-500 text-xs">
                    Expected response media type
                  </p>
                </div>
                <div>
                  <code className="text-gray-300 text-sm">User-Agent</code>
                  <p className="text-gray-500 text-xs">Client identifier</p>
                </div>
              </div>
            </InfoCard>
            <InfoCard title="Query Parameter Best Practices">
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>
                  Use <code className="text-gray-300">params</code> for GET,
                  DELETE requests
                </li>
                <li>
                  Avoid sensitive data in query parameters (they appear in logs)
                </li>
                <li>Use lists for multi-value parameters</li>
                <li>Auto URL-encoded — no manual encoding needed</li>
              </ul>
            </InfoCard>
          </div>
        </Section>

        <Section id="response-types" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Response Types In Depth
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              <code>responseType</code> controls how the body is parsed. For
              JSON, if the server claims JSON but the body isn't valid, the
              raw text is returned instead of raising — the same leniency
              axios/requests offer.
            </p>
          </div>
          <CodeBlock
            language="python"
            code={`client.get('/data')                          # responseType='json' (default)
client.get('/page', responseType='text')      # -> str
client.get('/image.png', responseType='arraybuffer')  # -> bytes
client.get('/report.pdf', responseType='blob')        # -> bytes

# For truly large responses, prefer client.stream() over responseType='stream'
# -- see Advanced Features > Streaming, Download & Pagination`}
          />
        </Section>

        <Section id="error-handling" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Error Types
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              AtomHTTP provides comprehensive error types with standardized
              error codes. By default, no exception is raised for 4xx/5xx --
              use <code>validateStatus</code> or <code>raise_for_status()</code>{" "}
              to opt in.
            </p>
          </div>
          <Table
            headers={["Error Type", "Description", "Error Code"]}
            rows={errorTypes}
          />

          <CodeBlock
            language="python"
            code={`from atomhttp.errors import AtomHTTPTimeoutError, AtomHTTPNetworkError, AtomHTTPRequestError

try:
    response = client.get('https://api.example.com/data', timeout=5, validateStatus=lambda s: s < 400)
except AtomHTTPTimeoutError as e:
    print(f"Timeout: {e.code}")  # ECONNABORTED
except AtomHTTPNetworkError as e:
    print(f"Network error: {e.code}")  # ERR_NETWORK
except AtomHTTPRequestError as e:
    print(f"Request failed: {e.code} - Status {e.response.status}")  # ERR_BAD_404`}
          />

          <InfoCard title="Error Handling Best Practices">
            <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
              <li>Catch specific error types before generic Exception</li>
              <li>
                Use <code className="text-gray-300">error.code</code> for
                programmatic handling
              </li>
              <li>
                Check <code className="text-gray-300">error.response.data</code>{" "}
                for server error details
              </li>
              <li>
                Use <code className="text-gray-300">retryConfig</code> for
                automatic retry on timeout/network errors instead of manual
                retry loops
              </li>
            </ul>
          </InfoCard>
        </Section>
      </div>
    </>
  );
}
