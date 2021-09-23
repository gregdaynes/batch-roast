const postTemplate = (data) => `
<!doctype html>
<html lang="en">
  <head>
    <title>${data.data.title}</title>
  </head>
  <body>
    ${String(data)}
  </body>
</html>
`

export { postTemplate }
