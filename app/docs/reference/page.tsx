"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  FileJson,
  FileText,
  File,
  Wind,
} from "lucide-react";
import Section from "@/components/shared/Section";
import CodeBlock from "@/components/ui/CodeBlock";

type TabId = "atomhttp" | "requests" | "httpx";

interface Tab {
  id: TabId;
  label: string;
  badge?: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: "atomhttp",
    label: "AtomHTTP",
    badge: <CheckCircle className="w-3 h-3 text-white" />,
  },
  {
    id: "requests",
    label: "requests",
    badge: <XCircle className="w-3 h-3 text-gray-500" />,
  },
  {
    id: "httpx",
    label: "httpx",
    badge: <XCircle className="w-3 h-3 text-gray-500" />,
  },
];

const comparisonTableData = [
  {
    feature: "Sync API (no event loop required)",
    atomhttp: "✓",
    requests: "✓",
    httpx: "✓",
  },
  {
    feature: "Async API, same transport as sync",
    atomhttp: "✓",
    requests: "✗",
    httpx: "✓ (separate client)",
  },
  {
    feature: "Minimal runtime dependencies",
    atomhttp: "✓ (urllib3 only)",
    requests: "✓",
    httpx: "✓ (httpcore)",
  },
  {
    feature: "Cancellation (AbortController)",
    atomhttp: "✓",
    requests: "✗",
    httpx: "Manual task.cancel()",
  },
  {
    feature: "Persistent thread pool for concurrency",
    atomhttp: "✓ (.all/.submit/.map)",
    requests: "Manual ThreadPoolExecutor",
    httpx: "n/a (asyncio.gather)",
  },
  {
    feature: "Streaming multipart uploads (constant memory)",
    atomhttp: "✓ (automatic)",
    requests: "Manual generator",
    httpx: "Manual generator",
  },
  {
    feature: "Upload/download progress callbacks",
    atomhttp: "✓",
    requests: "✗",
    httpx: "✗",
  },
  {
    feature: "Pagination helper",
    atomhttp: "✓ (.paginate())",
    requests: "✗",
    httpx: "✗",
  },
  {
    feature: "ETag/Cache-Control caching",
    atomhttp: "✓ (CacheInterceptor)",
    requests: "Needs requests-cache",
    httpx: "✗",
  },
  {
    feature: "Request/response interceptors",
    atomhttp: "✓",
    requests: "✗",
    httpx: "✓ (event hooks)",
  },
  {
    feature: "Retry with backoff + Retry-After",
    atomhttp: "✓ (built-in)",
    requests: "Needs urllib3 Retry manually",
    httpx: "Needs external lib",
  },
  {
    feature: "Unix domain socket support",
    atomhttp: "✓",
    requests: "Needs requests-unixsocket",
    httpx: "✓",
  },
  {
    feature: "SOCKS proxy support",
    atomhttp: "✓ (extra)",
    requests: "✓ (extra)",
    httpx: "✓ (extra)",
  },
  {
    feature: "Mock adapter for testing",
    atomhttp: "✓ (MockAdapter)",
    requests: "Needs responses/requests-mock",
    httpx: "✓ (MockTransport)",
  },
];

const codeExamples: Record<TabId, Record<string, string>> = {
  atomhttp: {
    basic: `from atomhttp import AtomHTTP

client = AtomHTTP(base_url='https://jsonplaceholder.typicode.com')
response = client.get('/posts/1')   # no await needed
print(response.status, response.data['title'])`,
    concurrent: `from atomhttp import AtomHTTP

client = AtomHTTP(base_url='https://jsonplaceholder.typicode.com', max_workers=10)

responses = client.all([
    lambda: client.get('/posts/1'),
    lambda: client.get('/posts/2'),
    lambda: client.get('/posts/3'),
])

for resp in responses:
    print(f"Post {resp.data['id']}: {resp.data['title'][:30]}...")`,
    progress: `from atomhttp import AtomHTTP

def on_upload(loaded, total):
    print(f"Upload: {loaded}/{total} bytes")

client = AtomHTTP(base_url='https://httpbin.org')
with open('test.txt', 'rb') as f:
    resp = client.post('/post', data=f.read(), onUploadProgress=on_upload)
print("Status:", resp.status)`,
    cancellation: `from atomhttp import AtomHTTP, AbortController
from atomhttp.errors import AtomHTTPCancelError

client = AtomHTTP(base_url='https://httpbin.org', timeout=30)
controller = AbortController()

# controller.abort() from another thread cancels this immediately:
try:
    client.get('/delay/10', signal=controller.signal)
except AtomHTTPCancelError:
    print("cancelled")`,
    validation: `from atomhttp import AtomHTTP
from atomhttp.errors import AtomHTTPRequestError

client = AtomHTTP(base_url='https://httpbin.org')

try:
    resp = client.get('/status/404', validateStatus=lambda status: status < 400)
except AtomHTTPRequestError as e:
    print(f"Request failed with status {e.response.status}")`,
  },
  requests: {
    basic: `import requests

response = requests.get('https://jsonplaceholder.typicode.com/posts/1')
print(response.status_code, response.json()['title'])`,
    concurrent: `import requests
from concurrent.futures import ThreadPoolExecutor

def fetch_post(post_id):
    resp = requests.get(f'https://jsonplaceholder.typicode.com/posts/{post_id}')
    return resp.json()

with ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(fetch_post, [1, 2, 3]))

for data in results:
    print(f"Post {data['id']}: {data['title'][:30]}...")`,
    progress: `import requests

# requests has no built-in progress callback -- you have to
# implement chunked reading of the request body yourself.
def upload_with_progress(path, url):
    total = len(open(path, 'rb').read())
    with open(path, 'rb') as f:
        requests.post(url, data=f)  # no per-chunk hook available`,
    cancellation: `# requests has no cancellation primitive at all.
# The only option is closing the underlying socket from another
# thread, which requests does not expose a supported way to do.`,
    validation: `import requests

response = requests.get('https://httpbin.org/status/404')
if response.status_code >= 400:
    response.raise_for_status()  # manual check required`,
  },

  httpx: {
    basic: `import httpx

response = httpx.get('https://jsonplaceholder.typicode.com/posts/1')
print(response.status_code, response.json()['title'])`,
    concurrent: `import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        responses = await asyncio.gather(*[
            client.get(f'https://jsonplaceholder.typicode.com/posts/{i}')
            for i in (1, 2, 3)
        ])
        for resp in responses:
            data = resp.json()
            print(f"Post {data['id']}: {data['title'][:30]}...")

asyncio.run(main())`,
    progress: `# httpx has no built-in progress callback -- you need to
# wrap the request body in a custom iterator and count bytes yourself.`,
    cancellation: `import asyncio

task = asyncio.create_task(client.get(url))
task.cancel()  # asyncio-only, requires holding the Task reference`,
    validation: `response = httpx.get('https://httpbin.org/status/404')
response.raise_for_status()  # manual check required`,
  },
};

const featureDescriptions: Record<string, string> = {
  basic: "A single request, the most common case for every library.",
  concurrent: "Running several requests at once.",
  progress: "Tracking upload progress with a callback.",
  cancellation: "Aborting an in-flight request from elsewhere in the program.",
  validation: "Rejecting non-2xx responses automatically.",
};

const featureTitles: Record<string, string> = {
  basic: "Basic Request",
  concurrent: "Concurrent Requests",
  progress: "Upload Progress Tracking",
  cancellation: "Request Cancellation",
  validation: "Status Validation",
};

const apiMethods = [
  ["client.get(url, **kwargs)", "HTTP GET request", "client.get('/users')"],
  [
    "client.post(url, data, **kwargs)",
    "HTTP POST request",
    "client.post('/users', data={...})",
  ],
  [
    "client.put(url, data, **kwargs)",
    "HTTP PUT request",
    "client.put('/users/1', data={...})",
  ],
  [
    "client.patch(url, data, **kwargs)",
    "HTTP PATCH request",
    "client.patch('/users/1', data={...})",
  ],
  [
    "client.delete(url, **kwargs)",
    "HTTP DELETE request",
    "client.delete('/users/1')",
  ],
  [
    "client.request(method, url, **kwargs)",
    "Generic request method",
    "client.request('GET', '/users')",
  ],
  [
    "client.stream(method, url, **kwargs)",
    "Streamed response, read incrementally",
    "with client.stream('GET', '/f') as r: ...",
  ],
  [
    "client.download(url, path, **kwargs)",
    "Download straight to disk",
    "client.download('/f.zip', 'f.zip')",
  ],
  [
    "client.paginate(url, **kwargs)",
    "Walk a paginated endpoint",
    "for items in client.paginate('/users'): ...",
  ],
  [
    "client.all(calls, max_workers=None)",
    "Run request thunks concurrently",
    "client.all([lambda: client.get('/a')])",
  ],
  [
    "client.submit(method, url, **kwargs)",
    "Fire-and-forget on the thread pool",
    "future = client.submit('GET', '/a')",
  ],
  [
    "client.map(method, urls, **kwargs)",
    "Same request, many URLs, concurrently",
    "client.map('GET', ['/a', '/b'])",
  ],
  [
    "client.close()",
    "Release pooled connections and the thread pool",
    "client.close()",
  ],
  [
    "client.as_async() / async_client.as_sync()",
    "Convert between sync/async, sharing state",
    "client.as_async()",
  ],
];

const configReferenceRows = [
  ["base_url", 'str = ""', "Prefix for relative URLs"],
  ["timeout", "int/float/timedelta = 30", "Request timeout in seconds"],
  ["headers", "dict = {}", "Default/per-request headers"],
  ["params", "dict = {}", "Query string parameters"],
  ["data", "Any = None", "Request body: dict/list, FormData, str, or bytes"],
  ["cookies", "bool = True", "Enable the client's persistent cookie jar"],
  ["max_workers", "int = 10", "Thread pool size for .all()/.submit()/.map()"],
  ["maxRedirects", "int = 5", "Max redirects to follow (0 disables)"],
  [
    "maxContentLength / maxBodyLength",
    "int = -1",
    "Response/request size caps in bytes (-1 = unlimited)",
  ],
  ["responseType", 'str = "json"', "json | text | blob | arraybuffer | stream"],
  [
    "validateStatus",
    "Callable | None",
    "fn(status) -> bool; raises AtomHTTPRequestError on False",
  ],
  ["auth", "dict | None", '{"username": ..., "password": ...} for Basic Auth'],
  [
    "proxy",
    "dict | None",
    "{'host': 'http://...'} or socks5://... ; falls back to env vars",
  ],
  [
    "verify",
    "bool | str = True",
    "TLS verification on/off, or a custom CA bundle path",
  ],
  ["cert", "str | tuple | None", "mTLS client certificate"],
  [
    "retryConfig",
    "dict | None",
    "max_retries, backoff_factor, status_forcelist",
  ],
  ["signal", "AbortSignal | None", "AbortController().signal for cancellation"],
  ["socketPath", "str | None", "Unix domain socket path"],
  [
    "onUploadProgress / onDownloadProgress",
    "Callable | None",
    "fn(loaded, total)",
  ],
  [
    "onRequestStart / onRetry / onRedirect",
    "Callable | None",
    "Lightweight observability hooks",
  ],
  [
    "adapter",
    "BaseAdapter | None",
    "Per-request adapter override, e.g. MockAdapter",
  ],
];

const errorCodesRows = [
  [
    "ERR_BAD_{status}",
    "Bad request (4xx) or rejected by validateStatus",
    "AtomHTTPRequestError",
  ],
  [
    "ERR_NETWORK",
    "DNS failure, connection refused, or other transport error",
    "AtomHTTPNetworkError",
  ],
  ["ECONNABORTED", "Request exceeded its timeout", "AtomHTTPTimeoutError"],
  [
    "ERR_CANCELED",
    "Request was aborted via AbortController",
    "AtomHTTPCancelError",
  ],
];

const responseTypesData = [
  {
    icon: FileJson,
    name: "json",
    desc: "Parses as dict/list. Default option -- falls back to raw text if the body isn't valid JSON.",
  },
  {
    icon: FileText,
    name: "text",
    desc: "Returns the body as a decoded str. Good for HTML, CSV, plain text.",
  },
  {
    icon: File,
    name: "blob / arraybuffer",
    desc: "Returns the raw body as bytes. For images, PDFs, ZIP files.",
  },
  {
    icon: Wind,
    name: "stream",
    desc: "Raw urllib3.HTTPResponse for manual reading -- prefer client.stream() instead for the friendlier API.",
  },
];

const migrationExamples = [
  {
    title: "Making a request",
    before: `# v1
client = AtomHTTP({'baseURL': 'https://api.example.com'})
response = await client.get('/users/1')
await client.close()`,
    after: `# v2.1
client = AtomHTTP(base_url='https://api.example.com')
response = client.get('/users/1')   # no await needed
client.close()`,
  },
  {
    title: "Concurrent requests",
    before: `# v1
responses = await AtomHTTP.all([
    client.get('/a'), client.get('/b'),
])`,
    after: `# v2.1
responses = client.all([
    lambda: client.get('/a'),
    lambda: client.get('/b'),
])
# or, if you still want async: await async_client.all([async_client.get('/a'), ...])`,
  },
  {
    title: "Async, if you still want it",
    before: `# v1 -- async was the only option
client = AtomHTTP({'baseURL': '...'})
response = await client.get('/users/1')`,
    after: `# v2.1 -- async is optional, via a separate class
async with AsyncAtomHTTP(base_url='...') as client:
    response = await client.get('/users/1')`,
  },
  {
    title: "Progress callback naming",
    before: `# v1
await client.post('/upload', data=f, on_upload_progress=cb)`,
    after: `# v2.1 -- camelCase, matching axios-style config
client.post('/upload', data=f, onUploadProgress=cb)`,
  },
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
          <tr
            key={i}
            className="border-b border-[#141414] last:border-0 hover:bg-white/2 transition-colors"
          >
            {row.map((cell, j) => (
              <td
                key={j}
                className={`py-3 px-4 text-sm ${j === 0 ? "font-mono text-gray-300" : "text-gray-500"}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ComparisonTable = () => (
  <div className="overflow-x-auto rounded-xl border border-[#1a1a1a] mb-8">
    <table className="w-full border-collapse min-w-[42rem]">
      <thead>
        <tr className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
          <th className="text-left py-3 px-4 text-gray-400 font-medium">
            Feature
          </th>
          <th className="text-left py-3 px-4 text-white font-bold bg-white/5">
            AtomHTTP
          </th>
          <th className="text-left py-3 px-4 text-gray-500 font-medium">
            requests
          </th>
          <th className="text-left py-3 px-4 text-gray-500 font-medium">
            httpx
          </th>
        </tr>
      </thead>
      <tbody>
        {comparisonTableData.map((row, i) => (
          <tr
            key={i}
            className="border-b border-[#141414] hover:bg-white/2 transition-colors"
          >
            <td className="py-3 px-4 text-gray-300 text-sm font-medium">
              {row.feature}
            </td>
            <td className="py-3 px-4 text-white text-sm font-medium bg-white/[0.03]">
              {row.atomhttp === "✓" ? (
                <CheckCircle className="w-4 h-4 text-white inline" />
              ) : (
                row.atomhttp
              )}
            </td>
            <td className="py-3 px-4 text-gray-500 text-sm">
              {row.requests === "✗" ? (
                <XCircle className="w-4 h-4 text-gray-600 inline" />
              ) : (
                row.requests
              )}
            </td>
            <td className="py-3 px-4 text-gray-500 text-sm">
              {row.httpx === "✗" ? (
                <XCircle className="w-4 h-4 text-gray-600 inline" />
              ) : (
                row.httpx
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FeatureTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabId;
  setActiveTab: (id: TabId) => void;
}) => (
  <div className="flex flex-wrap gap-2 border-b border-[#1a1a1a] mb-6">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-medium transition-all duration-200 ${
          activeTab === tab.id
            ? "bg-[#1a1a1a] text-white border-t border-x border-[#2a2a2a]"
            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        }`}
      >
        <span>{tab.label}</span>
        <span className="text-xs ml-1">{tab.badge}</span>
      </button>
    ))}
  </div>
);

const FeatureCard = ({
  activeTab,
  featureKey,
}: {
  activeTab: TabId;
  featureKey: string;
}) => (
  <div className="border border-[#1a1a1a] rounded-xl p-5 hover:border-[#2a2a2a] transition-all">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-medium text-white">
        {featureTitles[featureKey]}
      </h3>
    </div>
    <p className="text-gray-400 text-sm mb-4">
      {featureDescriptions[featureKey]}
    </p>
    <CodeBlock language="python" code={codeExamples[activeTab][featureKey]} />
  </div>
);

export default function ReferencePage() {
  const [activeTab, setActiveTab] = useState<TabId>("atomhttp");
  const featureKeys = [
    "basic",
    "concurrent",
    "progress",
    "cancellation",
    "validation",
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Reference
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Complete API reference, comparisons, migration notes, and practical
          examples
        </p>
      </div>

      <div className="space-y-10 sm:space-y-12">
        <Section id="comparison" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Comparison with Other Libraries
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              AtomHTTP combines what requests and httpx each do well --
              sync-first ergonomics, optional async, and modern features like
              cancellation and streaming -- in one client built on urllib3.
            </p>
          </div>

          <ComparisonTable />

          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-3">
              Side-by-side code
            </h3>
            <FeatureTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="space-y-6">
              {featureKeys.map((key) => (
                <FeatureCard key={key} activeTab={activeTab} featureKey={key} />
              ))}
            </div>
          </div>
        </Section>

        <Section id="examples" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Complete Examples
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              Two full, realistic examples combining several features.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-300 mb-2">
                Authenticated API client with retries and caching:
              </p>
              <CodeBlock
                language="python"
                code={`from atomhttp import AtomHTTP
from atomhttp.cache import CacheInterceptor

client = AtomHTTP(
    base_url="https://api.example.com",
    timeout=10,
    headers={"Authorization": "Bearer YOUR_TOKEN"},
    retryConfig={"max_retries": 3, "status_forcelist": [500, 502, 503, 504]},
)

cache = CacheInterceptor()
client.interceptors.request.use(cache.on_request)
client.interceptors.response.use(cache.on_response)

for items in client.paginate("/users"):
    for user in items:
        print(user["name"])

client.close()`}
              />
            </div>

            <div>
              <p className="text-sm text-gray-300 mb-2">
                Concurrent file downloads with a shared thread pool:
              </p>
              <CodeBlock
                language="python"
                code={`from atomhttp import AtomHTTP

client = AtomHTTP(base_url="https://files.example.com", max_workers=8)

urls = ["/a.zip", "/b.zip", "/c.zip"]
futures = [client.submit("GET", "/download" + u) for u in urls]

for url, future in zip(urls, futures):
    response = future.result()
    with open(url.lstrip("/"), "wb") as f:
        f.write(response.data)
    print(f"saved {url}")`}
              />
            </div>
          </div>
        </Section>

        <Section id="api-methods" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              API Methods Reference
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              Every method exists identically on <code>AsyncAtomHTTP</code>,
              just awaited.
            </p>
          </div>
          <Table
            headers={["Method", "Description", "Example"]}
            rows={apiMethods}
          />
        </Section>

        <Section id="config-reference" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              RequestConfig Fields
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              Every field below can be set on the client (as a default) or
              per-request (overriding the default).
            </p>
          </div>
          <Table
            headers={["Field", "Type / Default", "Description"]}
            rows={configReferenceRows}
          />
        </Section>

        <Section id="error-codes" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Error Codes Reference
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              AtomHTTP provides standardized error codes for programmatic error
              handling. By default no exception is raised for 4xx/5xx -- opt in
              with <code>validateStatus</code> or{" "}
              <code>raise_for_status()</code>.
            </p>
          </div>
          <Table
            headers={["Error Code", "Description", "Exception Type"]}
            rows={errorCodesRows}
          />
        </Section>

        <Section id="response-types" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Response Types
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              AtomHTTP supports multiple response types for different use cases.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {responseTypesData.map((rt) => (
              <div
                key={rt.name}
                className="border border-[#1a1a1a] rounded-xl p-4 hover:border-[#2a2a2a] transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <rt.icon className="text-white w-4 h-4" />
                  <code className="text-sm font-mono text-white font-bold">
                    {rt.name}
                  </code>
                </div>
                <p className="text-xs text-gray-500 mt-1">{rt.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="migration" className="scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Migrating from v1
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-3">
              v2 is a full rewrite: sync-first by default, minimal runtime
              dependencies, built on urllib3. The biggest change is that{" "}
              <code>AtomHTTP</code> is no longer async -- if you want async, use
              the new <code>AsyncAtomHTTP</code> class instead.
            </p>
          </div>

          <div className="space-y-6">
            {migrationExamples.map((ex) => (
              <div key={ex.title}>
                <p className="text-sm text-gray-300 mb-2">{ex.title}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Before (v1)</p>
                    <CodeBlock language="python" code={ex.before} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">After (v2.1)</p>
                    <CodeBlock language="python" code={ex.after} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-[#1a1a1a]">
            <p className="text-gray-400 text-sm">
              Other breaking changes: the constructor now takes plain keyword
              arguments (<code>AtomHTTP(base_url=..., timeout=...)</code>)
              instead of a single config dict; several internal v1 modules that
              were dead code (unused duplicate adapters, an unused cookie
              manager, an unused redirect handler) were removed entirely rather
              than ported forward.
            </p>
          </div>
        </Section>
      </div>
    </>
  );
}
