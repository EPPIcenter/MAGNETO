function summarizeNetwork (increment, transitions, nodesByIndex) {
    const networkMap = {};
    const startingNetwork = new Set();

    transitions.forEach(transition => {
      transition.add.forEach(j => startingNetwork.add(j));
      transition.remove.forEach(j => {
        if(startingNetwork.has(j)) {
          startingNetwork.delete(j)
        } else {
          if (networkMap.hasOwnProperty(j)) {
            networkMap[j] = networkMap[j] - increment;
          } else {
            networkMap[j] = -increment;
          }
        }
      });
      startingNetwork.forEach(idx => {
        if (networkMap.hasOwnProperty(idx)) {
          networkMap[idx] = networkMap[idx] + increment;
        } else {
          networkMap[idx] = increment;
        }
      });
    });

    return networkMap;
  }

function getNetwork(transitions, index) {
  const network = new Set();
  for (let i = 0; i < index; i++) {
    const transition = transitions[i];
    transition.add.forEach(j => network.add(j));
    transition.remove.forEach(j => network.delete(j));
  }
  return network;
}

function indexToEdge(index, nodesByIndex) {
  const source_index = Math.floor(index / Object.keys(nodesByIndex).length);
  const target_index = index % Object.keys(nodesByIndex).length;
  return {
    source: source_index,
    target: target_index,
    index: index
  };
}

addEventListener('message', (message) => {
  const data = JSON.parse(message.data)
  const increment = data.increment
  const transitions = data.transitions;
  const nodes = data.nodes;
  const networkSummary = summarizeNetwork(increment, transitions, nodes)
  postMessage(JSON.stringify(networkSummary));
});
