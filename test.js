const express = require("express");
const { Client, config } = require("kubernetes-client");

// Create an Express app
const app = express();
app.use(express.json());

// Create Kubernetes client
const client = new Client({ config: config.fromKubeconfig(), version: "1.13" });

// Define a route to create/update deployment
app.post("/create-deployment", async (req, res) => {
  const { replicas, image, namespace } = req.body;

  if (!replicas || replicas < 0) {
    return res
      .status(400)
      .json({ error: "Replicas must be a positive integer" });
  }

  if (!image) {
    return res.status(400).json({ error: "Image is required" });
  }

  const deploymentManifest = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: "simple-node-js",
      namespace: namespace || "default",
      labels: {
        app: "simple-node-js",
        version: "v1",
      },
    },
    spec: {
      replicas: replicas,
      selector: {
        matchLabels: {
          app: "simple-node-js",
        },
      },
      template: {
        metadata: {
          labels: {
            app: "simple-node-js",
          },
        },
        spec: {
          containers: [
            {
              name: "simple-node-js",
              image: image,
              ports: [
                {
                  containerPort: 8200,
                },
              ],
            },
          ],
        },
      },
    },
  };

  try {
    const namespaceExists = await client.api.v1
      .namespaces(namespace || "default")
      .get();
    if (!namespaceExists) {
      await client.api.v1.namespaces.post({
        body: {
          apiVersion: "v1",
          kind: "Namespace",
          metadata: {
            name: namespace || "default",
          },
        },
      });
    }

    await client.apis.apps.v1
      .namespaces(namespace || "default")
      .deployments("simple-node-js")
      .get()
      .then(() => {
        return client.apis.apps.v1
          .namespaces(namespace || "default")
          .deployments("simple-node-js")
          .patch({ body: deploymentManifest });
      })
      .catch(async (err) => {
        if (err.statusCode === 404) {
          return client.apis.apps.v1
            .namespaces(namespace || "default")
            .deployments.post({ body: deploymentManifest });
        } else {
          throw err;
        }
      });

    res.status(201).json({
      message: `Deployment created/updated successfully with ${replicas} replicas`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
