window.Model = function(options) {
    let resourceName = options.resourceName
    return {
        init: function() {
            var APP_ID = 'KvjA6BnYIuJReqnVQDC2bHSI-gzGzoHsz'
            var APP_KEY = 'OTnqsXdSJhsyMbIMCxQfILoY'
            AV.init({appId: APP_ID, appKey: APP_KEY})
        },
        fetch: function() {
            let query = new AV.Query(resourceName)
            return query.find()
        },
        save: function(object) {
            var X = AV.Object.extend(resourceName)
            var x = new X()
            return x.save(object)
        }
    }
}