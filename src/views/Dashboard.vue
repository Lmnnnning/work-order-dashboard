<template>
  <div class="dashboard">
    <a-layout class="layout">
      <a-layout-header class="header">
        <div class="header-left">
          <h2>📊 Work Order Dashboard</h2>
        </div>
        <div class="header-right">
          <a-tag :color="isAdmin ? 'red' : 'blue'">
            {{ isAdmin ? 'Administrator' : 'Regular User' }}
          </a-tag>
          <span class="user-name">Hi, {{ currentUser?.username }}</span>
          <a-button size="small" @click="onLogout">Log out</a-button>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <a-row :gutter="[24, 24]">
          <!-- 表格 -->
          <a-col :xs="24" :lg="14">
            <a-card title="Tasks" class="card">
              <a-table
                :columns="columns"
                :data-source="orderStore.list"
                :pagination="{ pageSize: 10 }"
                :row-key="(record) => record.id"
                size="middle"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'overtime'">
                    <a-tag :color="record.overtime ? 'orange' : 'default'">
                      {{ record.overtime ? 'Yes' : 'No' }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'hours'">
                    {{ record.hours }}h
                  </template>
                </template>
              </a-table>
            </a-card>
          </a-col>

          <!-- 图表 -->
          <a-col :xs="24" :lg="10">
            <a-card title="Project Hours Distribution" class="card chart-card">
              <BarChart :data="orderStore.groupedByProject" />

              <!-- 管理员可见：Delete 按钮位于卡片右下角 -->
              <div v-if="isAdmin" class="chart-footer">
                <a-button danger size="small" @click="openDeleteModal">Delete</a-button>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <!-- 选择要删除的工单 Modal -->
        <a-modal
          v-model:open="deleteModalVisible"
          title="Select work orders to delete"
          :ok-button-props="{ danger: true, disabled: selectedIds.length === 0 }"
          ok-text="Delete selected"
          cancel-text="Cancel"
          @ok="confirmDelete"
        >
          <a-alert
            v-if="orderStore.list.length === 0"
            type="info"
            message="No work orders to delete."
            show-icon
          />

          <a-checkbox-group
            v-else
            v-model:value="selectedIds"
            class="delete-checkboxes"
          >
            <a-space direction="vertical">
              <a-checkbox
                v-for="item in orderStore.list"
                :key="item.id"
                :value="item.id"
              >
                <strong>{{ item.id }}</strong> — {{ item.project }}
                <span class="muted">· {{ item.hours }}h · {{ item.created_at }}</span>
              </a-checkbox>
            </a-space>
          </a-checkbox-group>
        </a-modal>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useOrderStore } from '../stores/orders'
import BarChart from '../components/BarChart.vue'

const router = useRouter()
const orderStore = useOrderStore()

const currentUser = computed(() => {
  const raw = localStorage.getItem('currentUser')
  return raw ? JSON.parse(raw) : null
})
const isAdmin = computed(() => currentUser.value?.role === 'admin')

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Project', dataIndex: 'project', key: 'project' },
  { title: 'Overtime', dataIndex: 'overtime', key: 'overtime', width: 100 },
  { title: 'Hours', dataIndex: 'hours', key: 'hours', width: 100, align: 'right' },
  { title: 'Created At', dataIndex: 'created_at', key: 'created_at', width: 170 }
]

// 删除选择弹窗
const deleteModalVisible = ref(false)
const selectedIds = ref([])

const openDeleteModal = () => {
  selectedIds.value = []
  deleteModalVisible.value = true
}

const confirmDelete = () => {
  if (selectedIds.value.length === 0) return
  const count = selectedIds.value.length
  selectedIds.value.forEach((id) => orderStore.remove(id))
  selectedIds.value = []
  deleteModalVisible.value = false
  message.success(`Deleted ${count} work order(s). Chart updated.`)
}

const onLogout = () => {
  localStorage.removeItem('currentUser')
  router.replace('/login')
}
</script>

<style lang="less" scoped>
.dashboard {
  min-height: 100vh;

  .layout {
    min-height: 100vh;
    background: #f5f7fa;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #001529;
    padding: 0 24px;
    color: #fff;

    .header-left h2 {
      margin: 0;
      font-size: 18px;
      color: #fff;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-name {
        color: #d9d9d9;
        font-size: 14px;
      }
    }
  }

  .content {
    padding: 24px;
  }

  .card {
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }

  .chart-card {
    display: flex;
    flex-direction: column;

    .chart-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
  }

  .muted {
    color: #bfbfbf;
  }

  .delete-checkboxes {
    padding: 8px 0;
    max-height: 360px;
    overflow-y: auto;
  }
}
</style>
