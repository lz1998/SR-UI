<template>
    <div class="settings">
        <el-form>
            <el-form-item>
                <el-button type="primary" @click="handleAddStudent">添加学生</el-button>
                <el-button type="primary" @click="handleExportImportStudent">导出/导入学生</el-button>
                <span style="margin-left: 30px;color:red">因贫穷，数据存在浏览器缓存，可能丢失，如需保留数据导出后保存到文件，使用时导入</span>
            </el-form-item>
        </el-form>
        <el-table
                stripe
                :data="studentInfoList.filter(data=> !searchKeyword || data.name.toLowerCase().includes(searchKeyword.toLowerCase()) || data.id.toLowerCase().includes(searchKeyword.toLowerCase()))"
                max-height="500"
                style="width: 100%">
            <el-table-column
                    prop="id"
                    label="ID"
                    align="center"
                    width="150">
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="姓名"
                    align="center"
                    width="200">
            </el-table-column>
            <el-table-column
                    prop="timeRange[0]"
                    label="入学"
                    align="center"
                    width="150">
            </el-table-column>
            <el-table-column
                    prop="timeRange[1]"
                    label="退学"
                    align="center"
                    width="150">
            </el-table-column>
            <el-table-column
                    label="操作"
                    align="center"
                    width="240">
                <template slot="header" slot-scope="scope">
                    <el-input
                            v-model="searchKeyword"
                            size="mini"
                            placeholder="输入关键字搜索"/>
                </template>
                <template slot-scope="scope">
                    <el-button
                            size="mini"
                            type="success"
                            @click="handleShowStudentDetail(scope.$index, scope.row)">查看
                    </el-button>
                    <el-button
                            size="mini"
                            type="primary"
                            @click="handleEditStudent(scope.$index, scope.row)">编辑
                    </el-button>
                    <el-button
                            size="mini"
                            type="danger"
                            @click="handleDeleteStuent(scope.$index, scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :visible.sync="exportImportDialogVisible">
            <el-form>
                <el-form-item>
                    <el-button type="primary" @click="handleExportStudent">导出学生</el-button>
                    <el-button type="primary" @click="handleImportStudent">导入学生</el-button>
                    <span style="margin-left: 30px;color:red">没自动复制，请手动复制</span>
                </el-form-item>
                <el-form-item>
                    <el-input
                            type="textarea"
                            :rows="15"
                            placeholder="请输入内容"
                            v-model="exportImportStudentText">
                    </el-input>
                </el-form-item>
            </el-form>
        </el-dialog>
        <!--添加、编辑对话框-->
        <el-dialog :visible.sync="studentFormDialogVisible" :title="isAddOperation?'新增学生':'编辑学生'" width="50%">
            <el-form :model="studentForm">
                <el-form-item :label-width="formLabelWidth" label="WCAID">
                    <el-input v-model="studentForm.wcaid"></el-input>
                </el-form-item>
                <el-form-item :label-width="formLabelWidth" label="在校时间">
                    <el-date-picker
                            v-model="studentForm.timeRange"
                            type="monthrange"
                            value-format="yyyy-MM"
                            range-separator="至"
                            start-placeholder="入学月份"
                            end-placeholder="退学月份">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSaveStudent">保存</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog :visible.sync="studentDetailDialogVisible" title="学生详情" width="50%">
            <div v-html="studentDetail.replace(/\n/g,'<br/>')"></div>
        </el-dialog>
    </div>
</template>

<script>
    import {findPersonById, findBestSingleResultsByPersonId, findBestAverageResultsByPersonId} from '@/api/wca.js'
    import wcaResultFormat from '@/utils/wcaResultFormat.js'

    export default {
        name: 'settings',
        components: {},
        data() {
            return {
                eventOrder: ["333", "222", "444", "555", "666", "777", "333bf", "333fm", "333oh", "333ft", "clock", "minx", "pyram", "skewb", "sq1", "444bf", "555bf", "333mbf"],
                formLabelWidth: '120px',
                isAddOperation: false,
                studentFormDialogVisible: false,
                studentForm: {
                    wcaid: '',
                    timeRange: []
                },
                studentInfoList: [],
                searchKeyword: '',
                studentDetailDialogVisible: false,
                studentDetail: '',
                exportImportDialogVisible:false,
                exportImportStudentText:''
            }
        },
        methods: {
            handleExportImportStudent(){
                this.exportImportDialogVisible=true
                this.exportImportStudentText=''
            },
            handleExportStudent(){
                this.exportImportStudentText=JSON.stringify(this.studentInfoList)
            },
            handleImportStudent(){
                this.studentInfoList=JSON.parse(this.exportImportStudentText)
                this.saveStudentInfoList()
            },
            handleAddStudent() {
                this.isAddOperation = true
                this.studentFormDialogVisible = true
                this.studentForm = {
                    wcaid: '',
                    timeRange: []
                }
            },
            handleEditStudent(index, row) {
                this.isAddOperation = false
                this.studentFormDialogVisible = true
                this.studentForm = {
                    wcaid: row.id,
                    timeRange: row.timeRange
                }
            },
            handleSaveStudent() {
                findPersonById(this.studentForm.wcaid).then(res => {
                    if (res.data == undefined || res.data == null) {
                        this.$message({
                            message: "WCAID NOT FOUND!",
                            type: 'error',
                            duration: 3000
                        })
                    } else {
                        res.data.timeRange = this.studentForm.timeRange
                        let existed = false
                        let originInfo = res.data
                        this.studentInfoList.forEach(item => {
                            if (item.id == res.data.id) {
                                originInfo = item
                                existed = true
                            }
                        })
                        if (existed && this.isAddOperation) {
                            this.$message({
                                message: "WCAID EXISTED!",
                                type: 'error',
                                duration: 3000
                            })
                            return
                        }
                        if (this.isAddOperation) {
                            this.studentInfoList.push(originInfo)
                        } else {
                            originInfo.timeRange = res.data.timeRange
                        }
                        this.saveStudentInfoList()
                        this.studentFormDialogVisible = false
                    }
                })


            },
            handleDeleteStuent(index, row) {
                // 不能用slice，搜索后删除会出问题
                this.studentInfoList = this.studentInfoList.filter(item => {
                    return item.id != row.id
                })
                this.saveStudentInfoList()
            },
            async handleShowStudentDetail(index, row) {

                this.studentDetailDialogVisible = true
                this.studentDetail = row.name
                this.studentDetail += "\n" + row.id
                this.studentDetail += "," + row.countryId
                this.studentDetail += "," + (row.gender == 'm' ? 'Male' : 'Female')
                let singleDataList;
                await findBestSingleResultsByPersonId(row.id).then(res => {
                    singleDataList = res.data
                })
                let averageDataList;
                await findBestAverageResultsByPersonId(row.id).then(res => {
                    averageDataList = res.data
                })
                singleDataList = singleDataList.sort((a, b) => {
                    return this.eventOrder.indexOf(a.eventId) - this.eventOrder.indexOf(b.eventId)
                })
                singleDataList.forEach(singleData => {
                    let eventId = singleData.eventId
                    this.studentDetail += "\n" + eventId
                    this.studentDetail += " " + wcaResultFormat(singleData.best, eventId)
                    averageDataList.forEach(averageData => {
                        if (eventId == averageData.eventId) {
                            this.studentDetail += "|" + wcaResultFormat(averageData.best, eventId)
                        }
                    })
                })


            },
            saveStudentInfoList() {
                localStorage.setItem("studentInfoList", JSON.stringify(this.studentInfoList))
            },
            loadStudentInfoList() {
                let data = localStorage.getItem("studentInfoList")
                if (data != null) {
                    this.studentInfoList = JSON.parse(data)
                }
            }
        },
        mounted() {
            this.loadStudentInfoList()
        }
    }
</script>
<style lang="scss">
</style>
