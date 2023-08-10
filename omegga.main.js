let checkInterval;
let recentlyCrashed = false;

//let plListener;
let plTimeout;

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
	}
	
	async tick() {
		if(console.errorArray.length > 0) {
			const error = console.errorArray[1];
			console.errorArray = [];
			recentlyCrashed = true;
		}
	}
	
	async handleCrash(status, recent) {
		try{
		if(!status.isLoaded && status.isEnabled && recent) {
			recentlyCrashed = false;
			this.omegga.broadcast('<b>' + status.name + ' has crashed. Reloading in a few seconds...</>');
			const plug = this.omegga.pluginLoader.plugins.find(p => p.shortPath == status.name);
			const success = await plug.load();
			if(!success) {
				this.omegga.broadcast('<b>Failed to reload plugin.</>');
			}
		}
		}catch(e){this.omegga.broadcast('<b>Failed to reload plugin.</>')}
	}
	
	async init() {
		checkInterval = setInterval(() => this.tick(), 100);
		this.omegga.on('plugin:status', (plugin, status) => {
			if(status.name == "UnCrash") {
				return;
			}
			plTimeout = setTimeout(() => this.handleCrash(status, recentlyCrashed), 400);
		});
	}
	
	async stop() {
		console.error = console.defError;
		delete console.defError;
		//this.omegga.off('UnCrash');
		this.omegga.removeAllListeners("plugin:status");
		clearInterval(checkInterval);
		clearTimeout(plTimeout);
	}
}
