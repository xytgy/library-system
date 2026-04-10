<template>
  <div class="borrow-container">
    <!-- 查询表单 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="借阅人">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="图书名称">
          <el-input v-model="queryParams.bookTitle" placeholder="请输入图书名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="借阅中" :value="0" />
            <el-option label="已归还" :value="1" />
            <el-option label="已逾期" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <el-button type="primary" @click="handleBorrow">
            <el-icon><DocumentAdd /></el-icon> 新增借阅
          </el-button>
        </div>
      </template>

      <!-- 借阅表格 -->
      <el-table :data="filteredRecords" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="username" label="借阅人" align="center" />
        <el-table-column prop="bookTitle" label="图书名称" align="center" />
        <el-table-column prop="borrowDate" label="借阅日期" align="center" />
        <el-table-column prop="dueDate" label="应还日期" align="center" />
        <el-table-column prop="returnDate" label="归还日期" align="center">
          <template #default="scope">
            {{ scope.row.returnDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="statusMap[scope.row.status]?.type || 'info'">
              {{ statusMap[scope.row.status]?.label || '未知状态' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button
                v-if="scope.row.status !== 1"
                size="small"
                type="success"
                @click="handleReturn(scope.row)"
            >
              归还
            </el-button>
            <el-button
                v-if="hasAdminAccess"
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 借阅对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="图书借阅"
        width="500px"
        @closed="resetForm"
    >
      <el-form :model="borrowForm" :rules="rules" ref="borrowFormRef" label-width="100px">
        <el-form-item label="借阅人" prop="userId">
          <el-select v-model="borrowForm.userId" placeholder="请选择借阅人" filterable style="width: 100%">
            <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.nickname + ' (' + user.username + ')'"
                :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="借阅图书" prop="bookId">
          <el-select v-model="borrowForm.bookId" placeholder="请选择图书" filterable style="width: 100%">
            <el-option
                v-for="book in bookOptions"
                :key="book.id"
                :label="book.title"
                :value="book.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="借阅天数" prop="days">
          <el-input-number v-model="borrowForm.days" :min="1" :max="30" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, DocumentAdd } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getBorrowList, borrowBook, returnBook, deleteBorrow } from '@/api/borrow'
import type { BorrowRecord } from '@/api/borrow'
import { getUserList } from '@/api/user.ts'
import { getBookList } from '@/api/book'

// 状态映射
const statusMap: Record<number, { label: string, type: 'info' | 'success' | 'danger' | 'warning' }> = {
  0: { label: '借阅中', type: 'warning' },
  1: { label: '已归还', type: 'success' },
  2: { label: '已逾期', type: 'danger' }
}

// 查询参数
const queryParams = reactive({
  username: '',
  bookTitle: '',
  status: undefined as number | undefined
})

// 借阅记录数据
const borrowRecords = ref<BorrowRecord[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const borrowFormRef = ref<FormInstance>()

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const hasAdminAccess = computed(() => ['super_admin', 'admin'].includes(userInfo.role))

// 下拉选项数据
const userOptions = ref<any[]>([])
const bookOptions = ref<any[]>([])

// 获取选项数据
const getOptions = async () => {
  try {
    const userRes: any = await getUserList({ pageSize: 100 })
    userOptions.value = userRes.data
    const bookRes: any = await getBookList({ pageSize: 100 })
    if (bookRes.data && Array.isArray(bookRes.data.list)) {
      bookOptions.value = bookRes.data.list
    } else if (Array.isArray(bookRes.data)) {
      bookOptions.value = bookRes.data
    } else {
      bookOptions.value = []
    }
  } catch (error) {
    console.error('获取选项失败:', error)
  }
}

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const params: any = { ...queryParams }
    // 如果不是管理员或超管，强制只能查询自己的用户名
    if (!hasAdminAccess.value) {
      params.username = userInfo.username
    }

    const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== undefined)
    );
    const res: any = await getBorrowList(filteredParams)
    borrowRecords.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('获取借阅记录失败:', error)
    borrowRecords.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
  getOptions()
})

// 表单数据
const borrowForm = reactive({
  userId: undefined as number | undefined,
  bookId: undefined as number | undefined,
  days: 7
})

// 校验规则
const rules = reactive<FormRules>({
  userId: [{ required: true, message: '请选择借阅人', trigger: 'change' }],
  bookId: [{ required: true, message: '请选择图书', trigger: 'change' }],
  days: [{ required: true, message: '请输入借阅天数', trigger: 'blur' }]
})

// 过滤后的记录
const filteredRecords = computed(() => {
  if (!Array.isArray(borrowRecords.value)) return []
  return borrowRecords.value.filter(record => {
    const username = record.username || ''
    const bookTitle = record.bookTitle || ''
    const queryUsername = queryParams.username || ''
    const queryBookTitle = queryParams.bookTitle || ''

    const matchUser = username.toLowerCase().includes(queryUsername.toLowerCase())
    const matchBook = bookTitle.toLowerCase().includes(queryBookTitle.toLowerCase())
    const matchStatus = queryParams.status === undefined || record.status === queryParams.status
    return matchUser && matchBook && matchStatus
  })
})

const handleQuery = () => {
  getList()
}

const resetQuery = () => {
  queryParams.username = ''
  queryParams.bookTitle = ''
  queryParams.status = undefined
  handleQuery()
}

const handleBorrow = () => {
  dialogVisible.value = true
}

const handleReturn = (row: BorrowRecord) => {
  if (!row.id) return
  ElMessageBox.confirm(`确定归还图书 "${row.bookTitle}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await returnBook(row.id!)
      ElMessage.success('归还成功')
      await getList()
    } catch (error) {
      console.error('归还失败:', error)
    }
  })
}

const handleDelete = (row: BorrowRecord) => {
  if (!row.id) return
  ElMessageBox.confirm('确定要删除这条借阅记录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteBorrow(row.id!)
      ElMessage.success('删除成功')
      await getList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

const resetForm = () => {
  borrowFormRef.value?.resetFields()
  Object.assign(borrowForm, {
    userId: undefined,
    bookId: undefined,
    days: 7
  })
}

const submitForm = async () => {
  if (!borrowFormRef.value) return
  await borrowFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 如果是管理员或超管，使用选择的用户 ID，否则使用当前登录用户 ID
        const userId = hasAdminAccess.value ? borrowForm.userId : userInfo.id
        if (userId && borrowForm.bookId) {
          await borrowBook({
            userId: userId,
            bookId: borrowForm.bookId
          })
          ElMessage.success('借阅成功')
          dialogVisible.value = false
          await getList() // 刷新列表，学生此时应该能看到自己刚借的书了
        }
      } catch (error: any) {
        console.error('借阅失败:', error)
      }
    }
  })
}
</script>

<style scoped>
.borrow-container {
  padding: 20px;
}
.filter-card {
  margin-bottom: 20px;
}
.table-card {
  min-height: 500px;
}
.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
