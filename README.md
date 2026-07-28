# Reem Library — Public Site

Static public-facing digital library website (Arabic/English).

## Pages

- Home · Catalog · Book details · About · Contact

## Run locally

1. Start the API (`../api` → `dotnet run`)
2. Open with Live Server or:

```bash
npx serve .
```

## API configuration

Edit `js/config.js`:

```js
window.ELIBRARY_API_BASE = "http://localhost:5080";
```

## Deploy on Netlify

1. Push this folder to GitHub repo `reem-library-site`
2. Netlify → Import from Git → publish directory `.`
3. Site name suggestion: `reem-library-site`
4. Add Netlify URL to API CORS on Render

## Related projects

- **API backend:** `../api`
- **Admin dashboard:** `../admin`
