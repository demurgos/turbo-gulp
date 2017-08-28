async function main(): Promise<void> {
  console.log("main");
}

main().catch((err: Error): never => {
  console.error(err.stack);
  process.exit(1);
  return undefined as never;
});
