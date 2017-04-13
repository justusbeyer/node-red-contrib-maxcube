var MaxCube = require('maxcube');

module.exports = function(RED) {
  function MaxcubeNodeIn(config) {
    var node = this;
    RED.nodes.createNode(this, config);

    this.serverConfig = RED.nodes.getNode(config.server);

    if (!this.serverConfig) {
      return;
    }

    node.on('input', function(msg) {
      node.maxCube = new MaxCube(this.serverConfig.host, this.serverConfig.port);

      node.maxCube.on('closed', function () {
		node.status({fill:"red",shape:"ring",text:"disconnected"});
      });

      node.maxCube.on('connected', function () {
        node.maxCube.setTemperature(msg.payload.rf_address, msg.payload.degrees, msg.payload.mode, msg.payload.untilDate).then(function (success) {
          if (success) {
            node.log('Temperature set (' + [msg.payload.rf_address, msg.payload.degrees, msg.payload.mode, msg.payload.untilDate].filter(function (val) {return val;}).join(', ') + ')');
          } else {
            node.log('Error setting temperature');
          }
		  node.maxCube.close();
        }).catch(function(e) {
          node.warn(e);
		  node.maxCube.close();
        })
	  });
    });
  }
  RED.nodes.registerType("maxcube in", MaxcubeNodeIn);

  function MaxcubeNodeOut(config) {
    var node = this;
    RED.nodes.createNode(this, config);

    this.serverConfig = RED.nodes.getNode(config.server);

    if (!this.serverConfig) {
      return;
    }

    node.on('input', function(msg) {
      node.maxCube = new MaxCube(this.serverConfig.host, this.serverConfig.port);

      node.maxCube.on('closed', function () {
		node.status({fill:"red",shape:"ring",text:"disconnected"});
      });

      node.maxCube.on('connected', function () {
        node.status({fill:"green",shape:"dot",text:"connected"});
        node.maxCube.getDeviceStatus().then(function (payload) {
          // send devices statuses as separate messages
          node.send([payload.map(function function_name(deviceStatus) { return { rf_address: deviceStatus.rf_address, payload: deviceStatus }; })]);
          node.maxCube.close();
		}).catch(function(e) {
		  node.warn(e);
		  node.maxCube.close();
		});
      });
    });
  }
  RED.nodes.registerType("maxcube out", MaxcubeNodeOut);

  function MaxcubeServerNode(config) {
    var node = this;
    RED.nodes.createNode(this, config);

    this.host = config.host;
    this.port = config.port;

    if (!node.host || !node.port) {
      return;
    }
  }
  RED.nodes.registerType("maxcube-server", MaxcubeServerNode);
}
