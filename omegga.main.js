let checkInterval;
let recentlyCrashed = false;

module.exports = class Plugin {
	
	constructor(omegga, config, store) {
		this.omegga = omegga;
		this.config = config;
		this.store = store;
		console.defError = console.error.bind(console);
		console.errorArray = [];
		console.error = function(){
			console.errorArray.push(Array.from(arguments));
			console.defError.apply(console, arguments);
		}
		//process.on('uncaughtException', (err, origin) => {
			//console.log("test");
		//});
	}
	
	async tick() {
		if(console.errorArray.length > 0) {
			//console.log(console.errorArray);
			const error = console.errorArray[1];
			//const test = error.match(``);
			//console.log(test);
			console.errorArray = [];
			recentlyCrashed = true;
		}
	}
	
	async handleCrash(status, recent) {
		//console.log(status, recent);
		if(!status.isLoaded && status.isEnabled && recent) {
			recentlyCrashed = false;
			this.omegga.broadcast('<b>' + status.name + ' has crashed. Reloading in a few seconds...</>');
			const plug = this.omegga.pluginLoader.plugins.find(p => p.shortPath == status.name);
			const success = await plug.load();
			if(!success) {
				this.omegga.broadcast('<b>Failed to reload plugin.</>');
			}
		}
	}
	
	async init() {
		checkInterval = setInterval(() => this.tick(), 100);
		this.omegga.on('plugin:status', (plugin, status) => {
			if(status.name == "UnCrash") {
				return;
			}
			setTimeout(() => this.handleCrash(status, recentlyCrashed), 400);
		});
	}
	
	async stop() {
		//process.removeAllListeners('uncaughtException');
		//process.removeListener("unhandledRejection");
		console.error = console.defError;
		delete console.defError;
		this.omegga.removeAllListeners('plugin:status');
		//clearInterval(checkInterval);
	}
}
