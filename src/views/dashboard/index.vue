<template>
  <div class="dashboard-containter">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statistics" :key="item.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
        <el-col :span="16">
            <el-card shadow="hover" header="近七日借阅趋势">
                <div ref="trendChartRef" class="chart-box"></div>
            </el-card>
        </el-col>
        <el-col :span="8">
            <el-card shadow="hover" header="图书分类占比">
                <div ref="categoryChartRef" class="chart-box"></div>
            </el-card>
        </el-col>
    </el-row>


    <el-row :gutter="20" class="table-row">
      <el-col :span="24">
        <el-card shadow="hover" header="最近借阅动态">
          <el-table :data="recentBorrows" stripe style="width: 100%">
            <el-table-column prop="borrower" label="借阅人" width="120" />
            <el-table-column prop="bookName" label="图书名称" />
            <el-table-column prop="borrowDate" label="借阅日期" width="180" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.status === '已归还' ? 'success' : 'warning'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getRecentBorrows, getStatistics } from '@/api/borrow'
import * as echarts from 'echarts'
import { Notebook, User, Document, Warning } from '@element-plus/icons-vue'
const statistics = ref([
  { title: '图书总量', value: 1280, icon: Notebook, color: '#409EFF' },
  { title: '注册用户', value: 452, icon: User, color: '#67C23A' },
  { title: '当前借出', value: 85, icon: Document, color: '#E6A23C' },
  { title: '逾期未还', value: 12, icon: Warning, color: '#F56C6C' }
])

const recentBorrows = ref([
  { borrower: '张三', bookName: '深入理解计算机系统', borrowDate: '2023-12-24', status: '借阅中' },
  { borrower: '李四', bookName: '算法导论', borrowDate: '2023-12-23', status: '已归还' },
  { borrower: '王五', bookName: 'JavaScript高级程序设计', borrowDate: '2023-12-22', status: '借阅中' },
  { borrower: '赵六', bookName: '设计模式的可复用性', borrowDate: '2023-12-21', status: '已归还' },
  { borrower: '钱七', bookName: '数据结构 with C++', borrowDate: '2023-12-20', status: '已归还' }
])

const fetchRecentBorrows = async () => {
    try {
        //这个后端还没有写相关的API
        // const res = await getRecentBorrows()
        // recentBorrows.value = res.data
    } catch (error) {
        console.error('获取最近借阅动态失败:', error)
    }
}

const fetchStatistics = async () => {
    try {
        //这个后端还没有写相关的API
        // const res: any = await getStatistics()
        // const { totalBooks, totalUsers, currentBorrows, overdueBorrows } = res.data
        // statistics.value[0]!.value = totalBooks
        // statistics.value[1]!.value = totalUsers
        // statistics.value[2]!.value = currentBorrows
        // statistics.value[3]!.value = overdueBorrows
    } catch (error) {
        console.error('获取数据统计失败:', error)
    }
}


const trendChartRef = ref<HTMLElement | null>(null)
const categoryChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null


const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['12-18', '12-19', '12-20', '12-21', '12-22', '12-23', '12-24']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '借阅量',
        type: 'line',
        smooth: true,
        data: [15, 22, 18, 25, 30, 20, 28],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        itemStyle: { color: '#409EFF' }
      }
    ]
  })
}

const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  categoryChart = echarts.init(categoryChartRef.value)
  categoryChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', left: 'center' },
    series: [
      {
        name: '图书分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: 400, name: '计算机' },
          { value: 300, name: '文学' },
          { value: 200, name: '艺术' },
          { value: 150, name: '科学' },
          { value: 230, name: '其他' }
        ]
      }
    ]
  })
}

const handleResize = () => {
  trendChart?.resize()
  categoryChart?.resize()
}


onMounted( () => {
    fetchRecentBorrows()
    fetchStatistics()
    initTrendChart()
    initCategoryChart()
    window.addEventListener('resize', handleResize)
})


onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 30px;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-top: 10px;
}

.chart-box {
  height: 350px;
}

.table-row {
  margin-top: 20px;
}

:deep(.el-card__header) {
  font-weight: bold;
}

</style>
