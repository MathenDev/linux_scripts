module.exports = {
    optionParse: function (args = []) {
        let attrs = {};
        for (let i = 0; i < args.length; i++) {
            switch (args[i]) {
                case '-p':
                case '--port':
                    attrs.port = Number(args[++i]);
                    break;
                case '-f':
                case '--file':
                    attrs.file = args[++i];
                    break;
                case '-e':
                case '--encoding':
                    attrs.encoding = args[++i];
                    break;
                case '-s':
                case '--save':
                    attrs.modify = true;
                    break
            }
        }
        return attrs;
    },

    paramParse: function (entries = []) {
        let obj = {};
        if (entries) {
            for (let param of entries) {
                let eq = param.indexOf('=');
                if (eq > 0)
                    obj[param.slice(0, eq)] = param.slice(eq + 1);
            }
        }
        return obj;
    }
}
