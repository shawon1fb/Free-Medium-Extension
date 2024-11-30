// export interface OllamaResponse {
//     response: string;
//     done: boolean;
// }
//
// export class Ollama {
//     private readonly baseUrl: string;
//
//     constructor(baseUrl: string = 'http://localhost:11434') {
//         this.baseUrl = baseUrl;
//     }
//
//     private validateOllamaResponse(data: unknown): OllamaResponse {
//         if (!data || typeof data !== 'object') {
//             throw new Error('Invalid response: data is not an object');
//         }
//
//         const response = (data as any).response;
//         const done = (data as any).done;
//
//         if (typeof response !== 'string') {
//             throw new Error('Invalid response: response is not a string');
//         }
//         if (typeof done !== 'boolean') {
//             throw new Error('Invalid response: done is not a boolean');
//         }
//
//         return {
//             response,
//             done
//         };
//     }
//
//     async makeOllamaRequest(prompt: string, model: string = "llama3.2:latest"): Promise<OllamaResponse> {
//         try {
//             const response = await fetch(`${this.baseUrl}/api/generate`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     model: model,
//                     prompt: prompt,
//                     stream: false
//                 })
//             });
//
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//
//             const rawData = await response.json();
//             return this.validateOllamaResponse(rawData);
//         } catch (error) {
//             if (error instanceof Error) {
//                 throw new Error(`Failed to make Ollama request: ${error.message}`);
//             }
//             throw new Error('Failed to make Ollama request: Unknown error');
//         }
//     }
// }
