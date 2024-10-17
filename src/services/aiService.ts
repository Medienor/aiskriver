export const sendAICommand = async (command: string, selectedText: string) => {
  // Implement your API call here
  // For example:
  // const response = await fetch('your-api-endpoint', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ command, selectedText }),
  // });
  // return await response.json();

  // For now, let's return a mock response
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`AI response for command: ${command} on text: ${selectedText}`);
    }, 1000);
  });
};