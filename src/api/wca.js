import request from '@/utils/request'
// http://apiwca.lz1998.xin/wcaPerson/findPersonById?id=2016LIZH03
export function findPersonById(id){
    return request({
        url:'/wcaPerson/findPersonById',
        method:'get',
        params:{
            id
        }
    })
}

export function findBestSingleResultsByPersonId(personId) {
    return request({
        url:'/wcaSingle/findBestResultsByPersonId',
        method:'get',
        params:{
            personId
        }
    })
}
export function findBestAverageResultsByPersonId(personId) {
    return request({
        url:'/wcaAverage/findBestResultsByPersonId',
        method:'get',
        params:{
            personId
        }
    })
}

export function findResultsByPersonId(personId,pageNum,pageSize) {
    return request({
        url:'/wcaResult/findResultsByPersonId',
        method:'get',
        params:{
            personId,
            pageNum,
            pageSize
        }
    })
}

export function findCompetitionById(id) {
    return request({
        url:'/wcaCompetition/findCompetitionById',
        method:'get',
        params:{
            id
        }
    })
}

