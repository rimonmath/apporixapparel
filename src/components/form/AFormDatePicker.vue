<script setup lang="ts">
import type { FormErrors } from '@/utils/types';
import { NDatePicker, NFormItem } from 'naive-ui';
import { inject } from 'vue';

interface Props {
  label?: string;
  name: string;
  feedback?: string;
}

withDefaults(defineProps<Props>(), {});

const errors: FormErrors = inject('errors')!;
const formData: Record<string, any> = inject('formData')!;
</script>

<template>
  <div>
    <NFormItem
      :label="label"
      :feedback="feedback || errors[name]"
      :validation-status="errors[name] ? 'error' : 'success'"
    >
      <template #label>
        <strong v-if="label" class="text-gray-600">
          {{ label }}
        </strong>
      </template>
      <NDatePicker
        v-bind="$attrs"
        value-format="yyyy-MM-dd"
        v-model:formatted-value="formData[name]"
        :status="errors[name] ? 'error' : undefined"
        :input-props="{ name, autocomplete: name }"
      />
    </NFormItem>
  </div>
</template>
