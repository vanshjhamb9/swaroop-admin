import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore, adminStorage } from '../../firebaseadmin';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const dealerId = decodedToken.uid;

    let name, model, registration, experienceName, imageCount;
    let images: string[] = [];

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string;
      model = formData.get('model') as string;
      registration = formData.get('registration') as string;
      experienceName = formData.get('experienceName') as string || '';
      imageCount = parseInt(formData.get('imageCount') as string || '0');

      const filePromises: Promise<string>[] = [];
      const files = formData.getAll('images');

      // If 'images' is not found, check if they sent indexed keys like images[0], images[1] etc
      // (Common in some client libraries)
      // For now, simpler implementation assuming 'images' field has multiple values

      for (const file of files) {
        if (file instanceof File) {
          // Upload to Firebase Storage
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `dealers/${dealerId}/vehicles/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const bucket = adminStorage.bucket();
          const fileRef = bucket.file(filename);

          const uploadPromise = fileRef.save(buffer, {
            metadata: {
              contentType: file.type,
            },
            public: true, // Make public for easy access
          }).then(() => {
            return fileRef.publicUrl();
          });
          filePromises.push(uploadPromise);
        } else if (typeof file === 'string') {
          // Handle case where it might be a URL string in form data
          images.push(file);
        }
      }

      const uploadedUrls = await Promise.all(filePromises);
      images = [...images, ...uploadedUrls];

      // Update imageCount if not provided or 0
      if (!imageCount && images.length > 0) {
        imageCount = images.length;
      }

    } else {
      // Handle JSON
      const body = await request.json();
      name = body.name;
      model = body.model;
      registration = body.registration;
      experienceName = body.experienceName;
      imageCount = body.imageCount;
      images = body.images || [];
    }

    if (!name || !model || !registration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const vehicleRef = await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .collection('vehicles')
      .add({
        name,
        model,
        registration,
        experienceName: experienceName || '',
        images: images || [],
        imageCount: imageCount || 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });

    return NextResponse.json({
      id: vehicleRef.id,
      message: 'Vehicle created successfully',
      images: images // Return the uploaded URLs so client knows
    });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
