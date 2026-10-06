"use client";

import { useMemo, useState } from "react";
import {
    Calendar,
    Dna,
    Dog,
    FileText,
    Palette,
    Scale,
    User,
} from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import { useNumberField } from "@/hooks/useNumberField";
import {
    PET_SPECIES,
    petAgeSchema,
    petBreedSchema,
    petClientSchema,
    petColorSchema,
    petDescriptionSchema,
    petNameSchema,
    petSpeciesSchema,
    petWeightSchema,
} from "@/schemas/pet.schema";
import type { ClientResponse } from "@/types/client-api";
import type { Especie, Mascota } from "@/types/pet";

const ESPECIES: Especie[] = ["PERRO", "GATO", "AVE", "OTRO"];

const SPECIES_OPTIONS: DropdownOption[] = PET_SPECIES.map((species) => ({
    value: species,
    label: species,
}));

interface PetFormProps {
    mascotaEditando: Mascota | null;
    clientes: ClientResponse[];
    onSubmit: (mascota: Mascota) => Promise<void>;
    onCancel: () => void;
}

function getClientFullName(c: ClientResponse): string {
    return `${c.firstName ?? c.firtsName ?? ""} ${c.lastName}`.trim();
}

function buildInitial(mascota: Mascota | null): Omit<Mascota, "id"> {
    if (!mascota) {
        return {
            name: "",
            especie: "PERRO",
            breed: "",
            color: "",
            age: 0,
            weight: 0,
            clientId: "",
            ownerName: "",
            description: "",
        };
    }
    const { id, ...resto } = mascota;
    void id;
    return resto;
}

export default function PetForm({
    mascotaEditando,
    clientes,
    onSubmit,
    onCancel,
}: PetFormProps) {
    const isEditing = Boolean(mascotaEditando);
    const initial = buildInitial(mascotaEditando);

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const name = useField({
        initialValue: initial.name,
        validator: petNameSchema,
        validateOn: "blur",
    });

    const breed = useField({
        initialValue: initial.breed,
        validator: petBreedSchema,
        validateOn: "blur",
    });

    const color = useField({
        initialValue: initial.color,
        validator: petColorSchema,
        validateOn: "blur",
    });

    const description = useField({
        initialValue: initial.description,
        validator: petDescriptionSchema,
        validateOn: "blur",
    });

    const species = useField({
        initialValue: initial.especie,
        validator: petSpeciesSchema,
        validateOn: "blur",
    });

    const age = useNumberField({
        initialValue: initial.age,
        validator: petAgeSchema,
        validateOn: "blur",
    });

    const weight = useNumberField({
        initialValue: initial.weight,
        validator: petWeightSchema,
        validateOn: "blur",
    });

    const clientId = useField({
        initialValue: initial.clientId,
        validator: petClientSchema,
        validateOn: "blur",
    });

    const [clientLabel, setClientLabel] = useState(() => {
        if (!mascotaEditando) return "";
        if (mascotaEditando.ownerName) return mascotaEditando.ownerName;
        const c = clientes.find((x) => String(x.id) === String(mascotaEditando.clientId));
        return c ? getClientFullName(c) : "";
    });

    const clientOptions: DropdownOption[] = useMemo(
        () =>
            clientes.map((c) => ({
                value: String(c.id),
                label: getClientFullName(c),
                hint: c.dpi ? `DPI: ${c.dpi}` : undefined,
            })),
        [clientes]
    );

    const isFormValid =
        name.valid &&
        breed.valid &&
        color.valid &&
        description.valid &&
        species.valid &&
        age.valid &&
        weight.valid &&
        clientId.valid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [
            name.validate(),
            breed.validate(),
            color.validate(),
            description.validate(),
            species.validate(),
            age.validate(),
            weight.validate(),
            clientId.validate(),
        ];

        if (!results.every(Boolean)) return;

        const payload: Mascota = {
            id: mascotaEditando?.id ?? "",
            name: name.value.trim(),
            especie: species.value as Especie,
            breed: breed.value.trim(),
            color: color.value.trim(),
            age: age.value,
            weight: weight.value,
            clientId: clientId.value,
            ownerName: clientLabel.trim(),
            description: description.value.trim(),
        };

        try {
            setSubmitting(true);
            await onSubmit(payload);
        } catch (err) {
            setGeneralError(
                err instanceof Error ? err.message : "No se pudo guardar la mascota."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                    label="Nombre de la Mascota"
                    icon={<Dog />}
                    placeholder="Ej. Bucky, Luna..."
                    {...name.props}
                />

                <Dropdown
                    label="Especie"
                    icon={<Dna />}
                    options={SPECIES_OPTIONS}
                    value={species.value}
                    onValueChange={species.setValue}
                    onBlur={species.props.onBlur}
                    error={species.error}
                    placeholder="Selecciona una especie"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                    label="Raza"
                    icon={<Dna />}
                    placeholder="Ej. French Poodle, Criollo..."
                    {...breed.props}
                />
                <TextField
                    label="Color / Pelaje"
                    icon={<Palette />}
                    placeholder="Ej. Blanco con manchas café..."
                    {...color.props}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                    label="Edad (Años)"
                    icon={<Calendar />}
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    placeholder="0"
                    value={age.value === 0 ? "" : String(age.value)}
                    onValueChange={(v) => age.setValue(v === "" ? 0 : Number(v))}
                    onBlur={age.props.onBlur}
                    error={age.error}
                />
                <TextField
                    label="Peso (Kg)"
                    icon={<Scale />}
                    type="number"
                    min={0}
                    step="0.1"
                    placeholder="0.0"
                    value={weight.value === 0 ? "" : String(weight.value)}
                    onValueChange={(v) => weight.setValue(v === "" ? 0 : Number(v))}
                    onBlur={weight.props.onBlur}
                    error={weight.error}
                />
            </div>

            <Dropdown
                label="Dueño / Cliente"
                icon={<User />}
                options={clientOptions}
                value={clientId.value}
                onValueChange={(v) => {
                    clientId.setValue(v);
                    const option = clientOptions.find((o) => o.value === v);
                    setClientLabel(option?.label ?? "");
                }}
                onBlur={clientId.props.onBlur}
                error={clientId.error}
                placeholder="Buscar por nombre o DPI..."
                searchable
                searchPlaceholder="Escribe el nombre o DPI del dueño..."
                noResultsMessage="No se encontraron clientes con esa búsqueda."
                clearable
            />

            <TextArea
                label="Observaciones / Notas Clínicas"
                icon={<FileText />}
                placeholder="Alergias, temperamento, señas particulares..."
                rows={3}
                {...description.props}
            />

            <div className="mt-4 flex justify-end gap-3 border-t border-mint pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    loadingLabel="Guardando..."
                    disabled={!isFormValid || submitting}
                >
                    {isEditing ? "Actualizar" : "Guardar Mascota"}
                </Button>
            </div>
        </form>
    );
}