export class GraphQLClient {
  constructor(url, options) {
    this.url = url;
    this.options = options;
  }

  async rawRequest(query, variables) {
    const response = await fetch(this.url, {
      ...this.options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...this.options.headers,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const result = await response.json();
    return result;
  }

  async request(query, parameters) {
    const result = await this.rawRequest(query, parameters);
    const { data } = this.checkResult(result);
    return data;
  }

  checkResult(result) {
    if (result.errors && result.errors.length) {
      throw new Error(`GraphQL query resulted in the following errors:
    ${
      result.errors
        ? result.errors.map(({ message }) => `* ${message}`).join("\n")
        : JSON.stringify(result, null, 2)
    }`);
    }
    return result;
  }
}

export function gql(chunks, ...variables) {
  return chunks.reduce(
    (accumulator, chunk, index) =>
      `${accumulator}${chunk}${index in variables ? variables[index] : ""}`,
    ""
  );
}
