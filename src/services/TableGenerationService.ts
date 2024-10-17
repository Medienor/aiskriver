export async function generateTable(heading: string, paragraph: string): Promise<string> {
  console.log('Generating table with:', { heading, paragraph });

  const response = await fetch('/api/generate-table', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ heading, paragraph }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate table');
  }

  const data = await response.json();
  console.log('Received table HTML:', data.tableHtml);
  return data.tableHtml;
}