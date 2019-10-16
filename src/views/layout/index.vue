<template>
    <div class="layout">
        <el-container>
            <el-header>
                <el-menu  class="el-menu-demo" mode="horizontal" :router="true">
                    <el-menu-item index="/home">首页</el-menu-item>
                    <el-menu-item index="/settings">设置</el-menu-item>
                    <el-menu-item index="/display">查看</el-menu-item>
                    <el-menu-item index="/about">关于</el-menu-item>
                </el-menu>
            </el-header>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        name: "Layout"
    };
</script>

<style lang="scss">

</style>
