import { App } from "./app.js";
import { ApplicationContainer } from "./container/ApplicationContainer.js";

const container = new ApplicationContainer();
const app = new App(container).build();

app.listen(container.environment.apiPort, () => {
  console.log(`MerchAI API listening on http://localhost:${container.environment.apiPort}`);
});
