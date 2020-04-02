(function() {
	// to be modified
	var base = './js/';
	seajs.config({
		base : base,
		alias : {
			'lib/zepto' : 'lib/zepto.js',
			'lib/fastclick' : 'lib/fastclick.js'
		}
	});

	if (window.MX && MX.load) {
		var module = seajs.Module, fetch = module.prototype.fetch, fetchingList = {};
		module.prototype.fetch = function(requestCache) {
			var mod = this;
			seajs.emit('fetch', mod);
			var uri = mod.uri, info, file, version, load;
			if (uri.hasString(base)) {
				info = uri.split(base)[1].split('_');
				file = info[0];
				version = info[1];

				if (fetchingList[file]) {
					fetchingList[file].push(mod);
					return;
				}

				fetchingList[file] = [mod];

				load = {
						js : file,
						success : function() {
							var mods = fetchingList[file];
							delete fetchingList[file];
							while ((m = mods.shift()))
								m.load();
						}
					};
				if (version){
					load.version = version.slice(0, -3)
				}
				else {
					load.js = file.slice(0, -3);
				}
				MX.load(load);
			} else {
				fetch.call(mod, requestCache);
			}
		}
	}
})();
