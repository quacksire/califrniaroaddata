# DNS for AI Discovery (DNS-AID)

The California Road Data MCP server is available at
`https://californiaroaddata.com/mcp`, with its Server Card at
`https://californiaroaddata.com/.well-known/mcp/server-card.json`.

DNS-AID requires changes at the authoritative DNS provider, not an application
deploy. Publish the following ServiceMode records once the provider supports
the draft DNS-AID SVCB parameters and sign the public zone with DNSSEC:

```zone
; Advertise the site-wide MCP discovery endpoint.
_index._agents.californiaroaddata.com. 3600 IN SVCB 1 californiaroaddata.com. (
  alpn="mcp,h2,h3"
  well-known="/.well-known/mcp/server-card.json"
)

; Optional protocol-specific alias for clients that query it directly.
_mcp._agents.californiaroaddata.com. 3600 IN SVCB 1 californiaroaddata.com. (
  alpn="mcp,h2,h3"
  well-known="/.well-known/mcp/server-card.json"
)
```

The `well-known` parameter and the `mcp` ALPN identifier are proposed by the
DNS-AID Internet-Draft and may require a provider-specific numeric SvcParamKey
until IANA assigns final values. Keep the target name free of underscores so
the TLS certificate for `californiaroaddata.com` remains valid.

After publishing the records, enable DNSSEC at the registrar and confirm a
validating resolver returns authenticated SVCB data. The HTTP endpoints in this
repository are already deployed by the application and do not replace the DNS
publication step.
