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

                  <template v-else-if="column.key === 'action'">
                    <a-button
                      v-if="isAdmin"
                      danger
                      size="small"
                      @click="onDelete(record)"
                    >
                      Delete
                    </a-button>
                    <span v-else class="muted">—</span>
                  </template>
                </template>
              </a-table>
            </a-card>
          </a-col>

          <!-- 图表 -->
          <a-col :xs="24" :lg="10">
            <a-card title="Project Hours Distribution" class="card">
              <BarChart :data="orderStore.groupedByProject" />
            </a-card>
          </a-col>
        </a-row>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
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
  { title: 'Created At', dataIndex: 'created_at', key: 'created_at', width: 170 },
  { title: 'Action', key: 'action', width: 120, align: 'center' }
]

const onDelete = (record) => {
  Modal.confirm({
    title: 'Delete this work order?',
    content: `Project "${record.project}" (ID ${record.id}) will be removed.`,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk() {
      orderStore.remove(record.id)
      message.success('Deleted successfully. Chart updated.')
    }
  })
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

  .muted {
    color: #bfbfbf;
  }
}
</style>
