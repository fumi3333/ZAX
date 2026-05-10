async function main() {
  const res = await fetch('https://zax.fumiproject.dev/api/migrate');
  const text = await res.text();
  console.log("Migrate Response:", text);
}
main();
