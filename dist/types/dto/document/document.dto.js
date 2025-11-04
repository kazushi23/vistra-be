import 'express';
// map entity to dto for removal of unneeded data
export function toDocumentDto(document) {
    return {
        id: Number(document.id),
        name: document.name,
        createdBy: document.createdBy,
        updatedAt: Number(document.updatedAt),
        size: Number(document.size),
        type: document.type, // ensures type safety
    };
}
//# sourceMappingURL=document.dto.js.map