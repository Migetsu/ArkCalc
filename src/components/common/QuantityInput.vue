<script setup lang="ts">
import { Plus, Minus } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    size?: 'sm' | 'md';
  }>(),
  {
    min: 0,
    max: 999999,
    size: 'md',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'change', value: number): void;
}>();

function update(val: number) {
  const clamped = Math.max(props.min, Math.min(props.max, Math.floor(val || 0)));
  emit('update:modelValue', clamped);
  emit('change', clamped);
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const num = parseInt(target.value, 10);
  update(isNaN(num) ? 0 : num);
}

function adjust(delta: number) {
  update((props.modelValue || 0) + delta);
}
</script>

<template>
  <div class="inline-flex items-center gap-1 bg-ark-card border border-ark-border rounded-lg p-0.5 shadow-inner">
    <button
      type="button"
      class="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
      :disabled="modelValue <= min"
      title="-1"
      @click="adjust(-1)"
    >
      <Minus class="w-3.5 h-3.5" />
    </button>

    <input
      type="number"
      :value="modelValue"
      :min="min"
      :max="max"
      class="w-16 bg-transparent text-center font-mono font-semibold text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      @input="handleInput"
    />

    <button
      type="button"
      class="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
      :disabled="modelValue >= max"
      title="+1"
      @click="adjust(1)"
    >
      <Plus class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
