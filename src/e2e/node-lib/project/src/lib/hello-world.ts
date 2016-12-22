async function greetings(): Promise<string> {
  return "Hello, World!";
}

greetings().then(console.log, console.error);
