<template>
    <div class="display">
        <el-form>
            <el-form-item>
                <el-button @click="refreshData" :loading="loading" type="primary">刷新数据</el-button>
                <span style="margin-left: 30px;color:red">人多可能速度慢</span>
                <span style="margin-left: 30px;color:red">状态：{{status}}</span>
            </el-form-item>
        </el-form>
        <el-table
                stripe
                border
                :data="schoolRecordTable"
                style="width: 100%">
            <el-table-column
                    prop="eventId"
                    label="项目"
                    align="center"
                    width="80">
            </el-table-column>
            <el-table-column
                    prop="singleName"
                    label="单次姓名"
                    align="center"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="singleResult"
                    label="单次成绩"
                    align="center"
                    width="150">
            </el-table-column>
            <el-table-column
                    prop="averageName"
                    label="平均姓名"
                    align="center"
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="averageResult"
                    label="平均成绩"
                    align="center"
                    width="150">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {findResultsByPersonId, findCompetitionById} from '@/api/wca.js'
    import wcaResultFormat from '@/utils/wcaResultFormat.js'

    export default {
        name: 'display',
        components: {},
        data() {
            return {
                status: '等待用户操作',
                loading: false,
                eventOrder: ["333", "222", "444", "555", "666", "777", "333bf", "333fm", "333oh", "333ft", "clock", "minx", "pyram", "skewb", "sq1", "444bf", "555bf", "333mbf"],
                studentInfoList: [],// 学生信息 [info,info,info.....]
                studentInfoMap: {},// 学生信息 {wcaid1:info1,wcaid2:info2}
                studentResultList: [],// 学生成绩 [result1,result2....]
                studentResultListOnCampus: [],// 学生在校成绩 [result1,result2....]
                competitionIdList: [],// 所有学生参加的所有比赛id，不重复 [id1,id2....]
                competitionMap: {},//key compId,value competitionMap {compId1:info1,compId2:info2}

                studentEventResultMapOnCampus: {}, //根据项目分类好的成绩排名
                studentEventRankSingleMapOnCampus: {}, //根据项目分类好的单次成绩排名
                studentEventRankAverageMapOnCampus: {}, //根据项目分类好的平均成绩排名
                schoolRecordMap: {},
                schoolRecordList: [],
                schoolRecordTable: [] // Element-UI所需要的格式
            }
        },
        methods: {
            async refreshData() {
                this.loading = true
                // 从localStorage读学生信息list
                this.status = '读学生信息'
                this.loadStudentInfoList()


                // 学生信息转换为{wcaid:info}格式
                this.status = '转换学生信息'
                this.loadStudentInfoMap()

                // 读取所有学生所有比赛成绩
                this.status = '读取所有比赛成绩'
                await this.loadStudentResults()

                // 读取所有学生参加过的比赛，放入list，不重复
                this.status = '读取比赛ID'
                this.loadCompetitionIdListFromResults()

                // 读取所有比赛信息
                this.status = '读取比赛信息'
                await this.loadCompetitionInfo()

                // 过滤非在校期间成绩
                this.status = '过滤非在校期间成绩'
                this.loadStudentResultListOnCampus()

                // 按项目分类，{event1:[result1,result2...],event2:[result3,result4...]}
                this.status = '按项目分类成绩'
                this.loadStudentEventResultMapOnCampus()

                // 按项目分类，按单次排序
                this.status = '按单次排序成绩'
                this.loadStudentEventRankSingleMapOnCampus()

                // 按项目分类，按平均排序
                this.status = '按平均排序成绩'
                this.loadStudentEventRankAverageMapOnCampus()

                // 读取校纪录
                this.status = '读取校纪录'
                this.loadSchoolRecordMap()

                // // 校纪录list形式
                // this.loadSchoolRecordList()

                // 校纪录table形式
                this.status = '转换校纪录'
                this.loadSchoolRecordTable()

                // 结果存入localStorage
                this.status = '保存结果'
                this.saveSchoolRecordTable()

                this.status = '等待用户操作'
                this.loading = false
            },
            loadStudentInfoList() {
                let data = localStorage.getItem("studentInfoList")
                if (data != null) {
                    this.studentInfoList = JSON.parse(data)
                }
            },
            async loadStudentResults() {
                this.studentResultList = []
                let promiseList = this.studentInfoList.map(studentInfo => {
                    return new Promise(resolve => {
                        this.getPersonResults(studentInfo.id).then(res => {
                            this.studentResultList = this.studentResultList.concat(res)
                            resolve()
                        })
                    })
                })
                await Promise.all(promiseList)
            },
            loadCompetitionIdListFromResults() {
                let competitionIdSet = new Set()
                this.studentResultList.forEach(studentResult => {
                    competitionIdSet.add(studentResult.competitionId)
                })
                this.competitionIdList = Array.from(competitionIdSet)

            },
            getPersonResults(personId) {
                return new Promise(resolve => {
                    function getResultsPage(personId, resultList, pageNum) {
                        // TODO 1000是每页数量
                        findResultsByPersonId(personId, pageNum, 1000).then(res => {
                            resultList = resultList.concat(res.data)
                            if (res.pageLast) {
                                resolve(resultList)
                            } else {
                                pageNum++
                                getResultsPage(personId, resultList, pageNum)
                            }
                        })
                    }

                    getResultsPage(personId, [], 0)
                })
            },
            async loadCompetitionInfo() {
                // TODO 让网络开销更小，批量获取，需要后端配合
                // TODO 存入localStorage，如果已有不读取
                let promiseList = this.competitionIdList.map(competitionId => {
                    return new Promise(resolve => {
                        findCompetitionById(competitionId).then(res => {
                            this.competitionMap[competitionId] = res.data
                            resolve(competitionId)
                        })
                    })
                })
                await Promise.all(promiseList)
            },
            loadStudentInfoMap() {
                this.studentInfoList.forEach(studentInfo => {
                    this.studentInfoMap[studentInfo.id] = studentInfo
                })
            },
            loadStudentResultListOnCampus() {
                this.studentResultListOnCampus = this.studentResultList.filter(studentResult => {
                    let personId = studentResult.personId
                    let competition = this.competitionMap[studentResult.competitionId]
                    let compMonth = parseInt(competition.year) * 12 + parseInt(competition.month)
                    let tmp = this.studentInfoMap[personId].timeRange[0]
                    let stuStartMonth = parseInt(tmp.split("-")[0]) * 12 + parseInt(tmp.split("-")[1])
                    tmp = this.studentInfoMap[personId].timeRange[1]
                    let stuEndMonth = parseInt(tmp.split("-")[0]) * 12 + parseInt(tmp.split("-")[1])
                    return compMonth > stuStartMonth && compMonth < stuEndMonth

                })
            },
            loadStudentEventResultMapOnCampus() {
                this.studentEventResultMapOnCampus = {}
                this.studentResultListOnCampus.forEach(studentResult => {
                    if (!this.studentEventResultMapOnCampus[studentResult.eventId]) {
                        this.studentEventResultMapOnCampus[studentResult.eventId] = []
                    }
                    this.studentEventResultMapOnCampus[studentResult.eventId].push(studentResult)
                })
            },
            loadStudentEventRankSingleMapOnCampus() {
                this.studentEventRankSingleMapOnCampus = JSON.parse(JSON.stringify(this.studentEventResultMapOnCampus))
                for (let eventId in this.studentEventRankSingleMapOnCampus) {
                    this.studentEventRankSingleMapOnCampus[eventId].sort((a, b) => {
                        return a.best - b.best
                    })
                    this.studentEventRankSingleMapOnCampus[eventId] = this.studentEventRankSingleMapOnCampus[eventId].filter(result => {
                        return result.best > 0
                    })
                }
            },
            loadStudentEventRankAverageMapOnCampus() {
                this.studentEventRankAverageMapOnCampus = JSON.parse(JSON.stringify(this.studentEventResultMapOnCampus))
                for (let eventId in this.studentEventRankAverageMapOnCampus) {
                    this.studentEventRankAverageMapOnCampus[eventId].sort((a, b) => {
                        return a.average - b.average
                    })
                    this.studentEventRankAverageMapOnCampus[eventId] = this.studentEventRankAverageMapOnCampus[eventId].filter(result => {
                        return result.average > 0
                    })
                }
            },
            loadSchoolRecordMap() {
                this.eventOrder.forEach(eventId => {
                    let tmp = {
                        single: null,
                        average: null
                    }
                    if (this.studentEventRankSingleMapOnCampus[eventId] && this.studentEventRankSingleMapOnCampus[eventId].length > 0) {
                        tmp.single = this.studentEventRankSingleMapOnCampus[eventId][0]
                    }
                    if (this.studentEventRankAverageMapOnCampus[eventId] && this.studentEventRankAverageMapOnCampus[eventId].length > 0) {
                        tmp.average = this.studentEventRankAverageMapOnCampus[eventId][0]
                    }
                    this.schoolRecordMap[eventId] = tmp
                })
            },
            loadSchoolRecordList() {
                // 这种格式暂时没什么用，一开始写错了
                this.schoolRecordList = []
                this.eventOrder.forEach(eventId => {
                    let eventRecord = []
                    eventRecord.push(this.schoolRecordMap[eventId].single)
                    eventRecord.push(this.schoolRecordMap[eventId].average)
                    this.schoolRecordList.push(eventRecord)
                })
            },
            loadSchoolRecordTable() {
                // element-ui的table所需要的格式
                this.schoolRecordTable = []
                this.eventOrder.forEach(eventId => {
                    let eventRecord = {
                        eventId,
                        singleName: '-',
                        singleResult: '-',
                        averageName: '-',
                        averageResult: '-'
                    }
                    let result = null;
                    if (this.schoolRecordMap[eventId].single) {
                        result = this.schoolRecordMap[eventId].single
                        eventRecord.singleName = this.studentInfoMap[result.personId].name
                        eventRecord.singleResult = wcaResultFormat(result.best, eventId)
                    }
                    if (this.schoolRecordMap[eventId].average) {
                        result = this.schoolRecordMap[eventId].average
                        eventRecord.averageName = this.studentInfoMap[result.personId].name
                        eventRecord.averageResult = wcaResultFormat(result.average, eventId)
                    }
                    this.schoolRecordTable.push(eventRecord)
                })
            },
            saveSchoolRecordTable() {
                localStorage.setItem("schoolRecordTable", JSON.stringify(this.schoolRecordTable))
            }

        },
        mounted() {
            this.schoolRecordTable = JSON.parse(localStorage.getItem("schoolRecordTable"))

        }
    }
</script>
