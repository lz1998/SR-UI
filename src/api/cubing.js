// https://cubingchina.com/api/v0/competition/China-Championship-2015
import request from '@/utils/request'
export function getCompetitionInfo(competitionAlias) {
    return request({
        url:'https://cubingchina.com/api/v0/competition/'+competitionAlias,
        method:'get'
    })
}
