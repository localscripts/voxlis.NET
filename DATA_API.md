# Data API

Base URL while developing locally:

```text
http://localhost:8000/data
```

## Public

```http
GET /data?page=roblox
```

Returns only the public popularity list:

```json
["velocity", "madium", "solara", "xeno", "potassium"]
```

The real array length changes over time. It is always ordered from highest total card activity to lowest.

## Master Keys

Authenticated requests use `masterkey`.

Config options:

- `VOXLIS_DATA_MASTER_KEYS=key1,key2,key3`
- `VOXLIS_DATA_MASTER_KEY=key1`

If neither env var is set, the local fallback key is:

```text
uniquekey
```

## Full Data

```http
GET /data?page=roblox&masterkey=uniquekey
```

Returns the full `counts` object.

## Admin Actions

Admin actions are `POST` requests with JSON.

Common fields:

- `page`
- `masterkey`
- `admin_action`

### Get full data

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "get"
}
```

### Set one card counter

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "set",
  "scope": "card-action",
  "slug": "xeno",
  "action": "website",
  "value": 250
}
```

### Add or subtract from one card counter

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "add",
  "scope": "card-action",
  "slug": "xeno",
  "action": "website",
  "value": 5
}
```

Negative values are allowed for `add`. Counts never go below `0`.

### Set one UI counter

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "set",
  "scope": "ui-key",
  "group": "filters",
  "key": "drawer-open",
  "value": 100
}
```

### Reset values

Reset everything:

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "reset",
  "scope": "all"
}
```

Reset one card:

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "reset",
  "scope": "card",
  "slug": "xeno"
}
```

Reset one card action:

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "reset",
  "scope": "card-action",
  "slug": "xeno",
  "action": "website"
}
```

Reset one UI group:

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "reset",
  "scope": "ui-group",
  "group": "filters"
}
```

Reset one UI key:

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "reset",
  "scope": "ui-key",
  "group": "filters",
  "key": "drawer-open"
}
```

### Replace the full counts object

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "replace-counts",
  "counts": {
    "card_actions": {
      "xeno": {
        "website": 123
      }
    },
    "ui_events": {
      "filters": {
        "drawer-open": 55
      }
    }
  }
}
```

### Clear rate limits

Useful while testing bots locally:

```json
{
  "page": "roblox",
  "masterkey": "uniquekey",
  "admin_action": "clear-rate-limits"
}
```

## Notes

- `set` and `add` support only `card-action` and `ui-key`.
- `reset` supports `all`, `card`, `card-action`, `ui-group`, and `ui-key`.
- Admin responses return the updated full `counts` object.
