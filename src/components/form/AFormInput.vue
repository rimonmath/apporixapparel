<script setup lang="ts">
import type { FormErrors } from '@/utils/types';
import { NFormItem, NInput } from 'naive-ui';
import { inject } from 'vue';

// type ChildProps = InstanceType<typeof NInput>['$props'];

interface Props {
  label?: string;
  name: string;
  feedback?: string;
  suffix?: string;
  type?: 'textarea' | 'text' | 'password' | undefined;
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
      <NInput
        v-bind="$attrs"
        v-model:value="formData[name]"
        :status="errors[name] ? 'error' : undefined"
        :input-props="{ name, autocomplete: name }"
        :type="type"
      >
        <template v-if="suffix" #suffix>
          <span class="text-gray-400">
            {{ suffix }}
          </span>
        </template>
      </NInput>
    </NFormItem>
  </div>
</template>
