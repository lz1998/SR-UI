import Mock from 'mockjs'

Mock.mock('/test', 'get', require('./data/test.json'))
