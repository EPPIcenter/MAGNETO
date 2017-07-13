function summarizeNetwork (increment, transitions, nodesByIndex) {
    const networkMap = {};
    // const networkSummary = [];
    const startingNetwork = new Set();
    // const startingNetwork = getNetwork(transitions, burnin + 1);
    // transitions = transitions.slice(burnin, transitions.length);
    // const increment = 1 / transitions.length;
    // startingNetwork.forEach(idx => {
    //   if (networkMap.hasOwnProperty(idx)) {
    //     networkMap[idx] = networkMap[idx] + increment;
    //   } else {
    //     networkMap[idx] = increment;
    //   }
    // });

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
    // Object.keys(networkMap).forEach(idx => {
    //   const e = indexToEdge(+idx, nodesByIndex);
    //   e['weight'] = networkMap[idx];
    //   networkSummary.push(e);
    // });

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
  console.log("Loading Worker");
  const data = JSON.parse(message.data)
  const increment = data.increment
  const transitions = data.transitions;
  const nodes = data.nodes;
  const networkSummary = summarizeNetwork(increment, transitions, nodes)
  console.log("Returning network summary");
  postMessage(JSON.stringify(networkSummary));
});
