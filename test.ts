const k8s = require("@kubernetes/client-node");

const kc = new k8s.KubeConfig();
console.log("KC", kc);
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

console.log(k8sApi);

const namespace = {
  metadata: {
    name: "develop",
  },
};

const main = async () => {
  try {
    const createNamespaceRes = await k8sApi.createNamespace(namespace);
    console.log("New namespace created: ", createNamespaceRes.body);

    const readNamespaceRes = await k8sApi.readNamespace(
      namespace.metadata.name
    );
    console.log("Namespace: ", readNamespaceRes.body);
  } catch (err) {
    console.error(err);
  }
};

main();
