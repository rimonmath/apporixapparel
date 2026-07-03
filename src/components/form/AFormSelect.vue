<script setup lang="ts">
import type { FormErrors } from '@/utils/types';
import { NFormItem, NSelect } from 'naive-ui';
import { inject } from 'vue';

// type ChildProps = InstanceType<typeof NInput>['$props'];

interface Props {
  label?: string;
  name: string;
}

withDefaults(defineProps<Props>(), {});
const errors: FormErrors = inject('errors')!;
const formData: Record<string, any> = inject('formData')!;
</script>

<template>
  <NFormItem
    :label="label"
    :feedback="errors[name]"
    :validation-status="errors[name] ? 'error' : 'success'"
  >
    <template #label>
      <strong v-if="label" class="text-gray-600">
        {{ label }}
      </strong>
    </template>
    <NSelect
      v-bind="$attrs"
      v-model:value="formData[name]"
      :status="errors[name] ? 'error' : undefined"
      :input-props="{ name, autocomplete: name }"
    />
  </NFormItem>
</template>
