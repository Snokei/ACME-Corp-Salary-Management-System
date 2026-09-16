import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { Plus } from 'lucide-react';
import { DEPARTMENTS, PAY_GRADES, INITIAL_EMPLOYEE_FORM, ROLES, COUNTRIES, CITIES_BY_COUNTRY } from '@/constants';
import { createEmployeeAction, updateEmployeeAction } from '@/actions/employees';
import { Employee } from '@/types';

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Employee | null;
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddEmployeeModalProps) {
  const [formData, setFormData] = useState(initialData ? {
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
    department: initialData.department,
    role: initialData.role,
    country: initialData.country,
    city: initialData.city,
    baseSalary: initialData.baseSalary?.toString() || "",
    payGrade: initialData.payGrade || "L4",
  } : INITIAL_EMPLOYEE_FORM);

  // Update form data when initialData changes (e.g. when opening modal for a different employee)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        department: initialData.department,
        role: initialData.role,
        country: initialData.country,
        city: initialData.city,
        baseSalary: initialData.baseSalary?.toString() || "",
        payGrade: initialData.payGrade || "L4",
      });
    } else {
      setFormData(INITIAL_EMPLOYEE_FORM);
    }
  }, [initialData, isOpen]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let res;
      if (initialData) {
        const { baseSalary, ...updatePayload } = formData;
        res = await updateEmployeeAction(initialData.id, updatePayload);
      } else {
        res = await createEmployeeAction(formData);
      }

      if (!res.success) {
        throw new Error(res.error || `Failed to ${initialData ? 'update' : 'add'} employee`);
      }

      if (!initialData) {
        setFormData(INITIAL_EMPLOYEE_FORM);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(`Error ${initialData ? 'updating' : 'adding'} employee:`, err);
      setError(err?.message || `Failed to ${initialData ? 'update' : 'create'} employee record. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-amber-500" />
          <span>{initialData ? 'Edit Employee' : 'Add New Employee'}</span>
        </div>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Jane"
          />
          <Input
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="jane.doe@acmemail.com"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          >
            {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>

          <Select
            label="Role / Title"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

        <div className={initialData ? "block" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
          {!initialData && (
            <Input
              label="Base Salary (USD)"
              type="number"
              required
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
              placeholder="120000"
            />
          )}

          <Select
            label="Pay Grade"
            value={formData.payGrade}
            onChange={(e) => setFormData({ ...formData, payGrade: e.target.value })}
          >
            {PAY_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Country"
            value={formData.country}
            onChange={(e) => {
              const newCountry = e.target.value;
              const newCities = CITIES_BY_COUNTRY[newCountry] || [];
              setFormData({ 
                ...formData, 
                country: newCountry,
                city: newCities.length > 0 ? newCities[0] : "" // Auto-select first city when country changes
              });
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={!CITIES_BY_COUNTRY[formData.country]}
          >
            {(CITIES_BY_COUNTRY[formData.country] || []).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            shape="pill"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            shape="pill"
            disabled={submitting}
            isLoading={submitting}
          >
            {initialData ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
