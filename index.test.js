const request = require("supertest");
const app = require("./index"); // Importa a instância do app Express

describe("Testes das Rotas Principais e de Saúde", () => {
  // Teste para a rota raiz GET /
  it("deve retornar as informações do projeto na rota raiz", async () => {
    const response = await request(app).get("/");

    // Verifica se a resposta foi bem-sucedida (status 200)
    expect(response.statusCode).toBe(200);
    // Verifica se o corpo da resposta contém as propriedades esperadas
    expect(response.body).toHaveProperty("projeto", "Sistema de Gestão");
    expect(response.body).toHaveProperty("status", "online");
  });

  // Teste para a rota GET /saude
  it("deve retornar o status de saúde da aplicação", async () => {
    const response = await request(app).get("/saude");

    // Verifica se a resposta foi bem-sucedida (status 200)
    expect(response.status).toBe(200);
    // Verifica o conteúdo da resposta
    expect(response.body.status).toBe("ok");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("timestamp");
  });

  // Teste para uma rota que não existe (deve retornar 404)
  it("deve retornar 404 para uma rota não encontrada", async () => {
    const response = await request(app).get("/uma-rota-que-nao-existe");

    expect(response.status).toBe(404);
    expect(response.body.erro).toBe("Rota não encontrada");
  });
});
