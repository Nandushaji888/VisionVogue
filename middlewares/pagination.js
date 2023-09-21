
function pagination(model) {
    return (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit =3;


        const startIndex = (page - 1) * limit
        const endIndex = page * limit;

        const results = {}

        if(endIndex < model.length) {
            results.next = {
                page : page + 1,
                limit : limit
            }
        }

        if(startIndex > 0) {
            results.previous = {
                page : page - 1,
                limit : limit
            }
        }

        results.results = model.slice(startIndex, endIndex)

        res.pagination = results
        next()

    }
}