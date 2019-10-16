module.exports = {
    publicPath:'./',
    productionSourceMap:false,
    assetsDir:'static',
    devServer:{
        proxy:"http://apiwca.lz1998.xin/"
    }
}
