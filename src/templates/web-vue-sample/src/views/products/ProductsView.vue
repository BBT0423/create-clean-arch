<template>
  <PageHeader>
    <template #actions-left>
      <button type="button" class="btn btn-primary" @click="openCreate">+ New</button>
    </template>
  </PageHeader>

  <ProMessage />

  <div class="products-table">
    <div class="products-row products-row-head">
      <div>Id</div>
      <div>Name</div>
      <div>Created</div>
    </div>

    <div v-if="isLoading" class="products-state">
      <ProLoading variant="skeleton" :lines="3" />
    </div>
    <div v-else-if="products.length === 0" class="products-state products-empty">
      No products yet. Click <strong>+ New</strong> to add the first one.
    </div>
    <template v-else>
      <div v-for="product in products" :key="product.id" class="products-row">
        <div class="products-muted">#{{ product.id }}</div>
        <div>{{ product.name }}</div>
        <div class="products-muted">{{ formatDate(product.createdAt) }}</div>
      </div>
    </template>
  </div>

  <ProModal
    v-model:show="showCreate"
    title="New product"
    size="sm"
    confirm-text="Create"
    :confirm-disabled="saving"
    @confirm="createProduct"
  >
    <form novalidate @submit.prevent="createProduct">
      <label class="form-label" for="productName">Name</label>
      <input
        id="productName"
        v-model="form.name"
        class="form-input"
        maxlength="200"
        placeholder="Product name"
        autocomplete="off"
      />
      <div v-if="formError" class="form-error">{{ formError }}</div>
    </form>
  </ProModal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import PageHeader from '@/components/admin/PageHeader.vue';
import { useGlobalUi } from '@/composables/useGlobalUi';
import { productService } from '@/services/productService';
import type { Product } from '@/types/product';
import { toProblemDetails } from '@/utils/utilities';

const { showMessage } = useGlobalUi();

const products = ref<Product[]>([]);
const isLoading = ref(true);
const showCreate = ref(false);
const saving = ref(false);
const form = reactive({ name: '' });
const formError = ref('');

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const loadProducts = async () => {
  isLoading.value = true;
  try {
    const { data } = await productService.getAll();
    products.value = data;
  } catch (error: any) {
    console.error('Load products error:', error);
    showMessage(toProblemDetails(error));
  } finally {
    isLoading.value = false;
  }
};

const openCreate = () => {
  form.name = '';
  formError.value = '';
  showCreate.value = true;
};

const createProduct = async () => {
  formError.value = '';
  if (!form.name.trim()) {
    formError.value = 'Name is required.';
    return;
  }

  saving.value = true;
  try {
    await productService.create({ name: form.name.trim() });
    showCreate.value = false;
    // Every request clears global messages, so show the success message after reloading.
    await loadProducts();
    showMessage('Product created.', 'success');
  } catch (error: any) {
    console.error('Create product error:', error);
    formError.value = toProblemDetails(error).detail;
  } finally {
    saving.value = false;
  }
};

onMounted(loadProducts);
</script>

<style scoped>
.products-table {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.products-row {
  display: grid;
  grid-template-columns: 1fr 3fr 2fr;
  align-items: center;
  padding: 13px 16px;
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease;
}

.products-row:last-child {
  border-bottom: none;
}

.products-row:not(.products-row-head):hover {
  background: rgba(0, 84, 233, 0.04);
}

.products-row-head {
  padding: 11px 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.products-muted {
  color: var(--text-muted);
}

.products-state {
  padding: 20px 16px;
}

.products-empty {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

.form-error {
  color: var(--danger);
  font-size: 0.85em;
  margin-top: 6px;
}
</style>
