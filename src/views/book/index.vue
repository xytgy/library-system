<template>
  <div class="book-container">
    <!-- 查询表单 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="图书名称">
          <el-input v-model="queryParams.title" placeholder="请输入图书名称" clearable />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="queryParams.author" placeholder="请输入作者" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryParams.category" placeholder="请选择分类" clearable style="width: 180px">
            <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.name"
            />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 图书入库
          </el-button>
        </div>
      </template>

      <!-- 图书表格 -->
      <el-table :data="filteredBooks" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="isbn" label="ISBN" width="150" align="center" />
        <el-table-column prop="title" label="图书名称" align="center" />
        <el-table-column prop="author" label="作者" align="center" />
        <el-table-column prop="categoryName" label="分类" width="100" align="center">
          <template #default="scope">
            <el-tag>{{ scope.row.categoryName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="出版社" align="center" />
        <el-table-column prop="stock" label="库存数量" width="100" align="center" />
        <el-table-column prop="price" label="价格" width="100" align="center">
          <template #default="scope">
            ￥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 入库/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑图书' : '图书入库'"
        width="600px"
        @closed="resetForm"
    >
      <el-form :model="bookForm" :rules="rules" ref="bookFormRef" label-width="100px">
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" placeholder="请输入ISBN编号" />
        </el-form-item>
        <el-form-item label="图书名称" prop="title">
          <el-input v-model="bookForm.title" placeholder="请输入图书名称" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="bookForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="bookForm.publisher" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="bookForm.price" :precision="2" :step="0.1" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入库数量" prop="stock">
          <el-input-number v-model="bookForm.stock" :min="1" :step="1" style="width: 100%" />
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
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getBookList, addBook, updateBook, deleteBook } from '@/api/book'
import { getCategoryList } from '@/api/category'
import type { Book } from '@/api/book'
import type { Category } from '@/api/category'

// 查询参数
const queryParams = reactive({
  title: '',
  author: '',
  category: ''
})

// 图书列表数据
const bookList = ref<Book[]>([])
const categoryOptions = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const bookFormRef = ref<FormInstance>()

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const res: any = await getBookList(queryParams)
    // 兼容处理：如果 res.data 是数组直接赋值，如果是对象则尝试取 list 字段，否则给空数组
    if (Array.isArray(res.data)) {
      bookList.value = res.data
    } else if (res.data && Array.isArray(res.data.list)) {
      bookList.value = res.data.list
    } else {
      bookList.value = []
    }
  } catch (error) {
    console.error('获取图书列表失败:', error)
    bookList.value = []
  } finally {
    loading.value = false
  }
}

// 获取分类数据
const fetchCategories = async () => {
  try {
    const res: any = await getCategoryList()
    categoryOptions.value = res.data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

onMounted(() => {
  getList()
  fetchCategories()
})

// 表单数据
const bookForm = reactive<Book>({
  id: undefined,
  isbn: '',
  title: '',
  author: '',
  categoryId: undefined,
  publisher: '',
  publishDate: '',
  price: undefined as any,
  stock: 1,
  description: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  isbn: [{ required: true, message: '请输入ISBN编号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入图书名称', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }]
})

// 过滤后的图书列表
const filteredBooks = computed(() => {
  if (!Array.isArray(bookList.value)) return []
  return bookList.value.filter(book => {
    const matchTitle = (book.title || '').toLowerCase().includes(queryParams.title.toLowerCase())
    const matchAuthor = (book.author || '').toLowerCase().includes(queryParams.author.toLowerCase())
    // 这里简单处理分类过滤，实际应该根据 categoryId
    const matchCategory = queryParams.category === '' || book.categoryName === queryParams.category
    return matchTitle && matchAuthor && matchCategory
  })
})

// 查询和重置
const handleQuery = () => {
  getList()
}

const resetQuery = () => {
  queryParams.title = ''
  queryParams.author = ''
  queryParams.category = ''
  handleQuery()
}

// 新增和编辑
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: Book) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(bookForm, row)
}

const handleDelete = (row: Book) => {
  if (!row.id) return
  ElMessageBox.confirm(`确定要删除图书 "${row.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteBook(row.id!)
      ElMessage.success('删除成功')
      await getList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

const resetForm = () => {
  bookFormRef.value?.resetFields()
  Object.assign(bookForm, {
    id: undefined,
    isbn: '',
    title: '',
    author: '',
    categoryId: undefined,
    publisher: '',
    publishDate: '',
    price: undefined,
    stock: 1,
    description: ''
  })
}

const submitForm = async () => {
  if (!bookFormRef.value) return
  await bookFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          if (bookForm.id) {
            await updateBook(bookForm.id, bookForm)
            ElMessage.success('更新成功')
          }
        } else {
          await addBook(bookForm)
          ElMessage.success('入库成功')
        }
        dialogVisible.value = false
        await getList()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}
</script>

<style scoped>
.book-container {
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
